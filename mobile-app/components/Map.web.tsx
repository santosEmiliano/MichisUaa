import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Map, Overlay } from 'pigeon-maps';
import Supercluster from 'supercluster';

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
  const [bounds, setBounds] = useState<any>(null);
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

  const handleBoundsChanged = ({ center, zoom, bounds: newBounds }: any) => {
    setInternalCenter(center);
    setInternalZoom(zoom);
    setBounds(newBounds);
    
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

  const points = useMemo(() => {
    const childrenArray = React.Children.toArray(props.children);
    const validMarkers = childrenArray.filter((c: any) => React.isValidElement(c) && c.props.coordinate);
    return validMarkers.map((child: any, index) => ({
      type: 'Feature',
      properties: { cluster: false, childId: index, element: child },
      geometry: {
        type: 'Point',
        coordinates: [child.props.coordinate.longitude, child.props.coordinate.latitude]
      }
    }));
  }, [props.children]);

  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 50,
      maxZoom: 18
    });
    // @ts-ignore
    sc.load(points);
    return sc;
  }, [points]);

  const visibleElements = useMemo(() => {
    if (!bounds || !props.renderCluster) {
      return React.Children.map(props.children, (child: any) => {
        if (React.isValidElement(child) && (child as any).props.coordinate) {
          return React.cloneElement(child, {
            // @ts-ignore
            anchor: [(child as any).props.coordinate.latitude, (child as any).props.coordinate.longitude]
          });
        }
        return child;
      });
    }

    const bbox = [bounds.sw[1], bounds.sw[0], bounds.ne[1], bounds.ne[0]];
    const clusters = supercluster.getClusters(bbox, Math.round(internalZoom));

    return clusters.map((cluster: any) => {
      const [longitude, latitude] = cluster.geometry.coordinates;

      if (cluster.properties.cluster) {
        const clusterData = {
          id: cluster.id,
          geometry: cluster.geometry,
          properties: cluster.properties,
          onPress: () => {
            setInternalCenter([latitude, longitude]);
            setInternalZoom(Math.min(internalZoom + 2, 18));
          }
        };
        const clusterElement = props.renderCluster(clusterData);
        return React.cloneElement(clusterElement, {
          key: `cluster-${cluster.id}`,
          coordinate: { latitude, longitude }
        });
      } else {
        const originalElement = cluster.properties.element;
        return React.cloneElement(originalElement, {
          anchor: [latitude, longitude],
          key: `marker-${cluster.properties.childId}`
        });
      }
    });
  }, [points, supercluster, bounds, internalZoom, props.renderCluster, props.children]);

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
        {visibleElements}
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
      offset={[22, 53]}
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
  return <MapView ref={ref} {...props} />;
});
