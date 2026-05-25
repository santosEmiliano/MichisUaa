import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';

export default function WebNavigationBar({ state, descriptors, navigation }: any) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View style={[
      {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.9)',
        borderRadius: 30,
        paddingHorizontal: 28,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        gap: 40,
        borderWidth: 1,
        borderColor: colors.borderColor,
      },
      Platform.OS === 'web' && {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        
        // Ocultar explícitamente la ruta index y aquellas marcadas con href: null
        if (route.name === 'index' || options.href === null) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        let iconName = 'circle';
        if (route.name === 'map') iconName = 'map';
        if (route.name === 'sighting') iconName = 'plus-circle';
        if (route.name === 'profile') iconName = 'user';

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[
              { alignItems: 'center', justifyContent: 'center' },
              Platform.OS === 'web' && {
                transform: [{ scale: isFocused ? 1.1 : 1 }],
                transition: 'all 0.2s ease-in-out'
              } as any
            ]}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isFocused ? 'rgba(232,137,60,0.15)' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FontAwesome 
                name={iconName as any} 
                size={22} 
                color={isFocused ? colors.accentOrange : colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
