import React from 'react';
import { GooglePlacesInput } from '../../components/GooglePlacesInput';
import type { CityValue } from '../types/postForm.types';

type Props = {
  value: CityValue | null;
  onChange: (city: CityValue) => void;
  placeholder?: string;
};

export const PostFormCityPicker = ({ value, onChange, placeholder }: Props) => (
  <GooglePlacesInput
    value={value?.name ?? ''}
    onChange={name => onChange({ id: null, name })}
    placeholder={placeholder ?? 'Search city or location...'}
  />
);
