import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
// @ts-ignore
import { Map, Overlay } from 'pigeon-maps';
import {
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  UAA_REGION,
  clamp,
  zoomLevelForRegion,
} from '@/constants/mapConfig';

// El zoom se calcula con la misma proyección Mercator que usa la pantalla del
// mapa, para que web y nativo encuadren igual.

export const MapView = React.forwardRef((props: any, ref: any) => {
  const minZoom = props.minZoomLevel ?? MIN_ZOOM_LEVEL;
  const maxZoom = props.maxZoomLevel ?? MAX_ZOOM_LEVEL;

  const initialCenter = props.region
    ? [props.region.latitude, props.region.longitude]
    : props.initialRegion
    ? [props.initialRegion.latitude, props.initialRegion.longitude]
    : [UAA_REGION.latitude, UAA_REGION.longitude];

  const initialLatDelta =
    props.initialRegion?.latitudeDelta ??
    props.region?.latitudeDelta ??
    UAA_REGION.latitudeDelta;

  const initialRegion = props.initialRegion ?? props.region ?? UAA_REGION;

  const [internalCenter, setInternalCenter] = useState<[number, number]>(initialCenter as [number, number]);
  // El mapa ocupa prácticamente toda la ventana, así que sus medidas son una
  // buena estimación para el primer pintado.
  const [internalZoom, setInternalZoom] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth && window.innerHeight) {
      return clamp(
        zoomLevelForRegion(initialRegion, window.innerWidth, window.innerHeight),
        minZoom,
        maxZoom
      );
    }
    return minZoom;
  });
  const timeoutRef = useRef<any>(null);

  // Último `latitudeDelta` real reportado por pigeon-maps. Sirve de respaldo
  // para calcular el zoom de forma relativa si todavía no medimos el contenedor.
  const latDeltaRef = useRef<number>(initialLatDelta);

  // Tamaño real del contenedor, necesario para traducir una región a un nivel de zoom
  const viewportRef = useRef({ width: 0, height: 0 });
  const hasFittedInitialRef = useRef(false);

  const fitRegion = (region: any) => {
    const { width, height } = viewportRef.current;
    if (width > 0 && height > 0) {
      return clamp(zoomLevelForRegion(region, width, height), minZoom, maxZoom);
    }
    return null;
  };

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    viewportRef.current = { width, height };

    if (!hasFittedInitialRef.current && width > 0 && height > 0) {
      hasFittedInitialRef.current = true;
      const zoom = fitRegion(initialRegion);
      if (zoom !== null) setInternalZoom(zoom);
    }
  };

  useEffect(() => {
    if (props.region) {
      setInternalCenter([props.region.latitude, props.region.longitude]);
    }
  }, [props.region?.latitude, props.region?.longitude]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  React.useImperativeHandle(ref, () => ({
    animateToRegion: (region: any) => {
      setInternalCenter([region.latitude, region.longitude]);

      if (!region.latitudeDelta || !region.longitudeDelta) return;

      const fitted = fitRegion(region);
      if (fitted !== null) {
        setInternalZoom(fitted);
        return;
      }

      const zoomDelta = Math.log2(latDeltaRef.current / region.latitudeDelta);
      setInternalZoom((current) => clamp(current + zoomDelta, minZoom, maxZoom));
    },
  }));

  const handleBoundsChanged = ({ center, zoom, bounds }: any) => {
    setInternalCenter(center);
    setInternalZoom(zoom);

    const latitudeDelta = bounds
      ? Math.abs(bounds.ne[0] - bounds.sw[0])
      : latDeltaRef.current;
    const longitudeDelta = bounds
      ? Math.abs(bounds.ne[1] - bounds.sw[1])
      : latitudeDelta;

    latDeltaRef.current = latitudeDelta;

    const regionObj = {
      latitude: center[0],
      longitude: center[1],
      latitudeDelta,
      longitudeDelta,
    };

    if (props.onRegionChangeComplete) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        props.onRegionChangeComplete(regionObj);
      }, 250);
    }
  };

  const allowInteraction = props.scrollEnabled !== false && props.zoomEnabled !== false;

  return (
    <View style={[{ flex: 1, backgroundColor: '#f0f0f0' }, props.style]} onLayout={handleLayout}>
      <Map
        center={internalCenter}
        zoom={internalZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onBoundsChanged={handleBoundsChanged}
        mouseEvents={allowInteraction}
        touchEvents={allowInteraction}
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('close-callouts', { detail: null }));
          }
        }}
      >
        {React.Children.map(props.children, (child: any) => {
          if (React.isValidElement(child) && (child as any).props.coordinate) {
            return React.cloneElement(child, {
              // @ts-ignore
              anchor: [(child as any).props.coordinate.latitude, (child as any).props.coordinate.longitude]
            });
          }
          return child;
        })}
      </Map>
    </View>
  );
});

export const Callout = (props: any) => {
  return (
    <View style={{position: 'absolute', bottom: 50, zIndex: 1000}}>
      {props.children}
    </View>
  );
};

export const Marker = (props: any) => {
  const [showCallout, setShowCallout] = useState(false);
  const [renderCallout, setRenderCallout] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const { coordinate, onPress, children } = props;

  const toggleCallout = (e: any) => {
    if (e.stopPropagation) e.stopPropagation();
    const willShow = !showCallout;

    if (willShow && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-callouts', { detail: coordinate }));
    }

    setShowCallout(willShow);

    if (willShow) {
      setRenderCallout(true);
      Animated.spring(animValue, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setRenderCallout(false);
      });
    }

    if (onPress) onPress(e);
  };

  useEffect(() => {
    const handleClose = (e: any) => {
      if (e.detail !== coordinate && showCallout) {
        setShowCallout(false);
        Animated.timing(animValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setRenderCallout(false);
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('close-callouts', handleClose);
      return () => window.removeEventListener('close-callouts', handleClose);
    }
  }, [coordinate, showCallout, animValue]);

  if (!coordinate) return null;

  const childrenArray = React.Children.toArray(children);
  const callouts = childrenArray.filter((c: any) => c.type === Callout);
  const nonCallouts = childrenArray.filter((c: any) => c.type !== Callout);

  return (
    <Overlay
      anchor={[coordinate.latitude, coordinate.longitude]}
      offset={[0, 0]}
    >
      <div
        // @ts-ignore
        onClick={toggleCallout}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {renderCallout && (
          <Animated.View style={{
            opacity: animValue,
            transform: [
              { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }
            ],
            position: 'absolute',
            bottom: '110%',
            zIndex: 1000,
            minWidth: 160,
          }}>
            {callouts.map((c: any) => c.props.children)}
          </Animated.View>
        )}
        {nonCallouts}
      </div>
    </Overlay>
  );
};

export const MapClustering = React.forwardRef((props: any, ref: any) => {
  return <MapView ref={ref} {...props}>{props.children}</MapView>;
});
