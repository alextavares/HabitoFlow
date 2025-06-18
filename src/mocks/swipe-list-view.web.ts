// Mock do SwipeListView para desenvolvimento web
import React from 'react';
import { FlatList, View, TouchableOpacity, Text } from 'react-native';

export const SwipeListView = (props: any) => {
  // Simplificar para uma FlatList normal na web
  return React.createElement(FlatList, {
    ...props,
    renderItem: ({ item, index }: any) => {
      const renderItem = props.renderItem({ item, index });
      const renderHiddenItem = props.renderHiddenItem ? props.renderHiddenItem({ item, index }) : null;
      
      return React.createElement(View, { style: { position: 'relative' } }, [
        renderHiddenItem && React.createElement(View, { 
          key: 'hidden',
          style: { position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 0 } 
        }, renderHiddenItem),
        React.createElement(View, { key: 'visible', style: { zIndex: 1 } }, renderItem)
      ]);
    }
  });
};

export const SwipeRow = (props: any) => {
  // Simplificar para um TouchableOpacity normal
  return React.createElement(TouchableOpacity, {
    ...props,
    activeOpacity: props.activeOpacity || 1
  }, props.children);
};

export default {
  SwipeListView,
  SwipeRow
};