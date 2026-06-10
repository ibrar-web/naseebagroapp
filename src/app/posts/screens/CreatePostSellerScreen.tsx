import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import CategoryPostForm from '../components/CategoryPostForm';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostSeller'>;

const CreatePostSellerScreen = ({ navigation, route }: Props) => {
  const { category, categoryData } = route.params;

  return (
    <CategoryPostForm
      categoryName={category}
      categoryData={categoryData}
      mode="seller"
      navigation={navigation}
    />
  );
};

export default CreatePostSellerScreen;
