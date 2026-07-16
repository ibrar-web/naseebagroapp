import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import CategoryPostForm from '../components/CategoryPostForm';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBuyerDemand'>;

const CreateBuyerDemandScreen = ({ navigation, route }: Props) => {
  const { category, categoryData, prefillData, postId } = route.params;

  return (
    <CategoryPostForm
      categoryName={category}
      categoryData={categoryData}
      mode="buyer"
      navigation={navigation}
      prefillData={prefillData}
      postId={postId}
    />
  );
};

export default CreateBuyerDemandScreen;
