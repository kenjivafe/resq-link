import React from 'react';

interface ScreenProps {
  component?: React.ComponentType;
  children?: React.ReactNode;
}

const renderFirstScreen = (children: React.ReactNode) => {
  const childArray = React.Children.toArray(children);
  const firstScreen = childArray.find(
    (child): child is React.ReactElement<ScreenProps> => React.isValidElement(child)
  );

  if (firstScreen?.props.component) {
    const Component = firstScreen.props.component;
    return React.createElement(Component, null);
  }

  return null;
};

export const createNativeStackNavigator = () => ({
  Navigator: ({ children }: { children?: React.ReactNode }) => renderFirstScreen(children ?? null),
  Screen: ({ children }: ScreenProps) => children ?? null
});
