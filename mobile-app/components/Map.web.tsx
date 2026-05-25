import React from 'react';
import { View, Text } from 'react-native';

export const Marker = ({ children }: any) => <View>{children}</View>;
export const Callout = ({ children }: any) => <View>{children}</View>;

export const MapView = ({ style }: any) => (
  <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ textAlign: 'center', padding: 20, color: '#555', fontWeight: 'bold' }}>
      🗺️ El mapa interactivo no está disponible en la versión Web.
    </Text>
  </View>
);

export const MapClustering = MapView;
