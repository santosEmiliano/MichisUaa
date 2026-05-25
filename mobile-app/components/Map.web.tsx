import React, { useState } from 'react';
import { View } from 'react-native';
import { Map, Overlay } from 'pigeon-maps';

export const MapView = React.forwardRef((props: any, ref: any) => {
  const region = props.region || props.initialRegion;
  const center = region ? [region.latitude, region.longitude] : [21.9135, -102.3164];
  
  return (
    <View style={[{flex: 1, backgroundColor: '#f0f0f0'}, props.style]}>
      <Map 
        center={center as [number, number]} 
        zoom={16} 
        mouseEvents={true}
        touchEvents={true}
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
  const coord = props.coordinate;
  
  if (!coord) return null;
  
  const toggleCallout = (e: any) => {
    if (e.stopPropagation) e.stopPropagation();
    setShowCallout(!showCallout);
    if (props.onPress) props.onPress(e);
  };

  // Separar los hijos que son Callouts de los que son la vista normal del marcador
  const childrenArray = React.Children.toArray(props.children);
  const callouts = childrenArray.filter((c: any) => c.type === Callout);
  const nonCallouts = childrenArray.filter((c: any) => c.type !== Callout);

  return (
    <Overlay anchor={[coord.latitude, coord.longitude]} offset={[20, 40]}>
      <View 
        // @ts-ignore - Propiedad de react-native-web
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
