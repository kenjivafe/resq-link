import React from 'react';

interface PropsWithChildren {
  children?: React.ReactNode;
}

export const NavigationContainer = ({ children }: PropsWithChildren) =>
  React.createElement(React.Fragment, null, children);

export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn()
});

export const useRoute = () => ({
  name: 'MockRoute'
});
