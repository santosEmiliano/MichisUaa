import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
// @ts-ignore
import { Map, Overlay } from 'pigeon-maps';

export const MapView = React.forwardRef((props: any, ref: any) => {
  const initialCenter = props.region 
    ? [props.region.latitude, props.region.longitude]
    : props.initialRegion 
    ? [props.initialRegion.latitude, props.initialRegion.longitude] 
    : [21.9135, -102.3164];

  const latDeltaToZoom = (latDelta: number): number => {
    return Math.round(Math.log2(0.15 / latDelta)) + 11;
  };

  const initialZoom = props.initialRegion?.latitudeDelta
    ? latDeltaToZoom(props.initialRegion.latitudeDelta)
    : props.region?.latitudeDelta
    ? latDeltaToZoom(props.region.latitudeDelta)
    : 14;
    
  const [internalCenter, setInternalCenter] = useState<[number, number]>(initialCenter as [number, number]);
  const [internalZoom, setInternalZoom] = useState<number>(initialZoom);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (props.region) {
      setInternalCenter([props.region.latitude, props.region.longitude]);
    }
  }, [props.region?.latitude, props.region?.longitude]);

  React.useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, duration?: number) => {
      const newCenter: [number, number] = [region.latitude, region.longitude];
      setInternalCenter(newCenter);
      setInternalZoom(region.latitudeDelta ? latDeltaToZoom(region.latitudeDelta) : initialZoom);
      if (props.onRegionChangeComplete) {
        props.onRegionChangeComplete(region);
      }
    }
  }));

  const handleBoundsChanged = ({ center, zoom }: any) => {
    setInternalCenter(center);
    setInternalZoom(zoom);
    
    const regionObj = {
      latitude: center[0],
      longitude: center[1],
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
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
    <View style={[{flex: 1, backgroundColor: '#f0f0f0'}, props.style]}>
      <Map 
        center={internalCenter} 
        zoom={internalZoom}
        minZoom={14}
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
  
  const { coordinate, onPress, children, left, top, webOffset } = props;
  
  if (!coordinate) return null;
  
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

  const childrenArray = React.Children.toArray(children);
  const callouts = childrenArray.filter((c: any) => c.type === Callout);
  const nonCallouts = childrenArray.filter((c: any) => c.type !== Callout);

  return (
    <Overlay 
      anchor={[coordinate.latitude, coordinate.longitude]} 
      offset={[0, 0]}
      left={left}
      top={top}
    >
      {/* 
        El truco clave: offset=[0,0] significa que la esquina top-left del
        elemento queda exactamente en la coordenada geográfica.
        Con transform: translate(-50%, -100%) movemos el elemento para que
        su PUNTA INFERIOR CENTRAL quede en esa coordenada.
        Este approach es idéntico al de Google Maps y es independiente del zoom.
      */}
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
