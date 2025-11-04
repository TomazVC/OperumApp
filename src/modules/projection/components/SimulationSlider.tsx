import React, {useRef} from 'react';
import {PanResponder, View, LayoutChangeEvent} from 'react-native';
import styled from 'styled-components/native';

interface SimulationSliderProps {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const SliderContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const SliderHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const SliderLabel = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const SliderValue = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 18px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const SliderWrapper = styled.View`
  position: relative;
  height: 50px;
  justify-content: center;
`;

const SliderTrack = styled.View`
  height: 6px;
  background-color: ${({theme}) => theme.colors.border};
  border-radius: 3px;
  position: relative;
`;

const SliderFill = styled.View<{percentage: number}>`
  height: 6px;
  background-color: ${({theme}) => theme.colors.primary};
  border-radius: 3px;
  width: ${({percentage}) => percentage}%;
  position: absolute;
  left: 0;
  top: 0;
`;

const SliderThumb = styled.View<{position: number}>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({theme}) => theme.colors.primary};
  position: absolute;
  left: ${({position}) => position}%;
  margin-left: -12px;
  top: 50%;
  margin-top: -12px;
  ${({theme}) => theme.shadows.md}
  border-width: 3px;
  border-color: #FFFFFF;
  border-style: solid;
`;

const TouchableArea = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const SimulationSlider: React.FC<SimulationSliderProps> = ({
  label,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  formatValue,
}) => {
  const trackWidth = useRef(0);
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
  
  const displayValue = formatValue ? formatValue(value) : value.toString();

  const updateValue = (locationX: number) => {
    if (trackWidth.current === 0) return;
    
    const newPercentage = Math.max(0, Math.min(100, (locationX / trackWidth.current) * 100));
    const newValue = minimumValue + (newPercentage / 100) * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    onValueChange(clampedValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidth.current = event.nativeEvent.layout.width;
  };

  return (
    <SliderContainer>
      <SliderHeader>
        <SliderLabel>{label}</SliderLabel>
        <SliderValue>{displayValue}</SliderValue>
      </SliderHeader>
      <SliderWrapper>
        <SliderTrack onLayout={handleLayout}>
          <SliderFill percentage={percentage} />
          <SliderThumb position={percentage} />
        </SliderTrack>
        <TouchableArea {...panResponder.panHandlers} />
      </SliderWrapper>
    </SliderContainer>
  );
};

export default SimulationSlider;

