import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Text } from 'react-native';
import { supabase } from '@/infrastructure/supabase/client';

type Account = {
  id: string;
  name: string;
};

type TransactionFiltersProps = {
  selectedAccountId?: string;
  onSelectAccount: (accountId?: string) => void;
};

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  selectedAccountId,
  onSelectAccount,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching accounts:', error);
          return;
        }

        setAccounts(data || []);
      } catch (error) {
        console.error('Error in fetchAccounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          {selectedAccount ? selectedAccount.name : 'Filtrar por cuenta'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
            
            {isLoading ? (
              <Text>Cargando cuentas...</Text>
            ) : (
              <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.accountItem,
                      selectedAccountId === item.id && styles.selectedAccountItem,
                    ]}
                    onPress={() => {
                      onSelectAccount(item.id);
                      setIsVisible(false);
                    }}
                  >
                    <Text style={styles.accountName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noAccountsText}>No hay cuentas disponibles</Text>
                }
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  onSelectAccount(undefined);
                  setIsVisible(false);
                }}
                style={[styles.button, styles.clearButton]}
              >
                <Text style={styles.clearButtonText}>Limpiar filtro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={[styles.button, styles.closeButton]}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedAccountItem: {
    backgroundColor: '#EFF6FF',
  },
  accountName: {
    fontSize: 16,
  },
  noAccountsText: {
    textAlign: 'center',
    padding: 16,
    color: '#6B7280',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  closeButton: {
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
