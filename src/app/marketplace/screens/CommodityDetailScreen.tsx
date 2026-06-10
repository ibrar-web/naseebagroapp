import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import BuyerCommodityDetail from '../components/BuyerCommodityDetail';
import SellerCommodityDetail from '../components/SellerCommodityDetail';

type Props = NativeStackScreenProps<RootStackParamList, 'CommodityDetail'>;

const CommodityDetailScreen = (props: Props) => {
  const mode = useAppSelector(s => s.app.mode);

  if (mode === 'seller') {
    return <SellerCommodityDetail {...props} />;
  }

  return <BuyerCommodityDetail {...props} />;
};

export default CommodityDetailScreen;
