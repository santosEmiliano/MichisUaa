import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Map, Overlay } from 'pigeon-maps';

export const MapView = React.forwardRef((props: any, ref: any) => {
  const initialCenter = props.region 
    ? [props.region.latitude, props.region.longitude]
    : props.initialRegion 
    ? [props.initialRegion.latitude, props.initialRegion.longitude] 
    : [21.9135, -102.3164];

  // Convierte latitudeDelta a zoom de pigeon-maps para igualar la escala nativa
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
      setInternalZoom(region.latitudeDelta ? latDeltaToZoom(region.latitudeDelta) : initialZoom);
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
        {React.Children.map(props.children, (child: any) => {
          if (React.isValidElement(child) && child.props.coordinate) {
            return React.cloneElement(child, {
              // @ts-ignore
              anchor: [child.props.coordinate.latitude, child.props.coordinate.longitude]
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
  
  // Extraemos SOLO las props que usamos — nunca pasamos props de react-native-maps
  // a pigeon-maps porque corrompen el anclado geográfico del Overlay.
  // pigeon-maps inyecta 'left' y 'top' porque MapView ahora inyecta 'anchor' al Marker.
  const { coordinate, onPress, children, left, top } = props;
  
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
  // Para un marcador de 44×44px queremos anclar en la base-centro: [17, 34]
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

// Evitamos la librería de clustering porque tiene dependencias nativas internas.
// En su lugar, usamos el MapView normal como un "fallback" transparente.
export const MapClustering = React.forwardRef((props: any, ref: any) => {
  return <MapView ref={ref} {...props}>{props.children}</MapView>;
});
