import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Map, Overlay } from 'pigeon-maps';

export const MapView = React.forwardRef((props: any, ref: any) => {
  const initialCenter = props.region 
    ? [props.region.latitude, props.region.longitude]
    : props.initialRegion 
    ? [props.initialRegion.latitude, props.initialRegion.longitude] 
    : [21.9135, -102.3164];
    
  const [internalCenter, setInternalCenter] = useState<[number, number]>(initialCenter as [number, number]);
  const [internalZoom, setInternalZoom] = useState<number>(16);
  const timeoutRef = useRef<any>(null);

  // Sincronizar cuando la 'region' externa cambia (ej. componente controlado en minimapas)
  useEffect(() => {
    if (props.region) {
      setInternalCenter([props.region.latitude, props.region.longitude]);
    }
  }, [props.region?.latitude, props.region?.longitude]);

  // Simulamos la API nativa de react-native-maps para que el botón de recentrar funcione en web
  React.useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, duration?: number) => {
      const newCenter: [number, number] = [region.latitude, region.longitude];
      setInternalCenter(newCenter);
      setInternalZoom(16);
      if (props.onRegionChangeComplete) {
        props.onRegionChangeComplete(region);
      }
    }
  }));

  // Notificamos a la app cuando el usuario mueve el mapa web manualmente
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
        onBoundsChanged={handleBoundsChanged}
        mouseEvents={allowInteraction}
        touchEvents={allowInteraction}
      >
        {props.children}
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
  
  // Extraemos SOLO las props que usamos — nunca pasamos props de react-native-maps
  // a pigeon-maps porque corrompen el anclado geográfico del Overlay.
  const { coordinate, onPress, children } = props;
  
  if (!coordinate) return null;
  
  const toggleCallout = (e: any) => {
    if (e.stopPropagation) e.stopPropagation();
    setShowCallout(prev => !prev);
    if (onPress) onPress(e);
  };

  // Separar los hijos que son Callouts de los que son la vista normal del marcador
  const childrenArray = React.Children.toArray(children);
  const callouts = childrenArray.filter((c: any) => c.type === Callout);
  const nonCallouts = childrenArray.filter((c: any) => c.type !== Callout);

  // offset: [x, y] — el punto (x,y) del overlay coincide con la coordenada del mapa.
  // Para un marcador de 44×44px queremos anclar en la base-centro: [22, 44]
  return (
    <Overlay 
      anchor={[coordinate.latitude, coordinate.longitude]} 
      offset={[17, 34]}
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

// Evitamos la librería de clustering porque tiene dependencias nativas internas.
// En su lugar, usamos el MapView normal como un "fallback" transparente.
export const MapClustering = React.forwardRef((props: any, ref: any) => {
  return <MapView ref={ref} {...props}>{props.children}</MapView>;
});
