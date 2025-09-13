import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';

export type TransactionDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

export type TransactionDetailScreenNavigationProp = {
  navigate: (screen: 'EditTransaction', params: { transactionId: string }) => void;
  goBack: () => void;
  setOptions: (options: any) => void;
};
