import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
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
  
  const { coordinate, onPress, children, left, top } = props;
  
  if (!coordinate) return null;
  
  const toggleCallout = (e: any) => {
    if (e.stopPropagation) e.stopPropagation();
    const willShow = !showCallout;
    if (willShow && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-callouts', { detail: coordinate }));
    }
    setShowCallout(willShow);
    if (onPress) onPress(e);
  };

  useEffect(() => {
    const handleClose = (e: any) => {
      if (e.detail !== coordinate) {
        setShowCallout(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('close-callouts', handleClose);
      return () => window.removeEventListener('close-callouts', handleClose);
    }
  }, [coordinate]);

  const childrenArray = React.Children.toArray(children);
  const callouts = childrenArray.filter((c: any) => c.type === Callout);
  const nonCallouts = childrenArray.filter((c: any) => c.type !== Callout);

  return (
    <Overlay 
      anchor={[coordinate.latitude, coordinate.longitude]} 
      offset={[17, 34]}
      left={left}
      top={top}
    >
      <View 
        // @ts-ignore
        onClick={toggleCallout}
        style={{ cursor: 'pointer', alignItems: 'center', position: 'relative' }}
      >
        {showCallout && callouts}
        {nonCallouts}
      </View>
    </Overlay>
  );
};

export const MapClustering = React.forwardRef((props: any, ref: any) => {
  return <MapView ref={ref} {...props}>{props.children}</MapView>;
});
