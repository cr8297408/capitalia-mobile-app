import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Text, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/infrastructure/supabase/client';

type Account = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type DateRange = {
  startDate?: Date;
  endDate?: Date;
};

type FilterType = 'account' | 'category' | 'date';

type TransactionFiltersProps = {
  selectedAccountId?: string;
  selectedCategoryId?: string;
  selectedDateRange?: DateRange;
  onSelectAccount: (accountId?: string) => void;
  onSelectCategory: (categoryId?: string) => void;
  onSelectDateRange: Dispatch<SetStateAction<DateRange | undefined>>;
  onClearAll: () => void;
};

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  selectedAccountId,
  selectedCategoryId,
  selectedDateRange,
  onSelectAccount,
  onSelectCategory,
  onSelectDateRange,
  onClearAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tempDateRange, setTempDateRange] = useState<DateRange>({});
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState({
    accounts: true,
    categories: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('id, name')
          .order('name', { ascending: true });

        if (accountsError) throw accountsError;

        // Fetch categories and remove duplicates by ID
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;

        // Remove duplicate categories by ID
        const uniqueCategories = Array.from(
          new Map((categoriesData || []).map((item: { id: string; name: string }) => [item.id, item])).values()
        ) as Category[];

        setAccounts(accountsData || []);
        setCategories(uniqueCategories);
      } catch (error: any) {
        console.error('Error fetching filter data:', error);
      } finally {
        setIsLoading(prev => ({
          ...prev,
          accounts: false,
          categories: false,
        }));
      }
    };

    fetchData();
  }, []);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  
  const hasActiveFilters = selectedAccountId || selectedCategoryId || selectedDateRange?.startDate || selectedDateRange?.endDate;

  const renderFilterContent = () => {
    if (activeFilter === 'account') {
      return (
        <View style={styles.filterContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.filterTitle}>Seleccionar cuenta</Text>
            <TouchableOpacity onPress={() => setActiveFilter(null)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          {isLoading.accounts ? (
            <Text>Cargando cuentas...</Text>
          ) : (
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    selectedAccountId === item.id && styles.selectedFilterItem,
                  ]}
                  onPress={() => {
                    onSelectAccount(item.id);
                    setActiveFilter(null);
                  }}
                >
                  <Text style={styles.filterItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    }

    if (activeFilter === 'category') {
      return (
        <View style={styles.filterContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.filterTitle}>Seleccionar categoría</Text>
            <TouchableOpacity onPress={() => setActiveFilter(null)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          {isLoading.categories ? (
            <Text>Cargando categorías...</Text>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    selectedCategoryId === item.id && styles.selectedFilterItem,
                  ]}
                  onPress={() => {
                    onSelectCategory(item.id);
                    setActiveFilter(null);
                  }}
                >
                  <Text style={styles.filterItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    }

    if (activeFilter === 'date') {
      return (
        <View style={styles.filterContent}>
          <Text style={styles.filterTitle}>Seleccionar rango de fechas</Text>
          <View style={styles.dateInputContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setCurrentDate(tempDateRange.startDate || new Date());
                setShowDatePicker('start');
              }}
            >
              <Text style={styles.dateText}>
                {tempDateRange.startDate && tempDateRange.endDate
                  ? `${format(tempDateRange.startDate, 'dd MMM yyyy', { locale: es })} - ${format(tempDateRange.endDate, 'dd MMM yyyy', { locale: es })}`
                  : 'Seleccionar fechas'}
              </Text>
              <Calendar size={16} color="#6B7280" />
              
              {showDatePicker && (
                <DateTimePicker
                  value={currentDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(null);
                    
                    if (selectedDate) {
                      if (showDatePicker === 'start') {
                        const newStartDate = selectedDate;
                        const endDate = tempDateRange.endDate || new Date(newStartDate);
                        
                        // Si la fecha de inicio es mayor que la de fin, actualizamos ambas
                        if (newStartDate > endDate) {
                          setTempDateRange({
                            startDate: newStartDate,
                            endDate: newStartDate
                          });
                        } else {
                          setTempDateRange(prev => ({
                            ...prev,
                            startDate: newStartDate
                          }));
                        }
                        // Mostrar el selector para la fecha final
                        setCurrentDate(endDate);
                        setShowDatePicker('end');
                      } else {
                        // Actualizar solo la fecha final si es mayor o igual que la de inicio
                        const newEndDate = selectedDate;
                        const startDate = tempDateRange.startDate || new Date();
                        
                        if (newEndDate >= startDate) {
                          setTempDateRange(prev => ({
                            ...prev,
                            endDate: newEndDate
                          }));
                        } else {
                          // Si la fecha final es menor, establecer el mismo día
                          setTempDateRange(prev => ({
                            ...prev,
                            endDate: startDate
                          }));
                        }
                      }
                    }
                  }}
                />
              )}
            </TouchableOpacity>
            <View style={styles.dateButtons}>
              <TouchableOpacity
                style={[styles.dateButton, styles.clearDateButton]}
                onPress={() => {
                  setTempDateRange({});
                  onSelectDateRange(undefined);
                  setActiveFilter(null);
                }}
              >
                <Text style={styles.clearDateText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.applyDateButton]}
                onPress={() => {
                  onSelectDateRange(tempDateRange);
                  setActiveFilter(null);
                }}
                disabled={!tempDateRange.startDate || !tempDateRange.endDate}
              >
                <Text style={styles.applyDateText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedAccountId && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('account')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedAccountId && styles.activeFilterButtonText,
          ]}>
            {selectedAccount?.name || 'Cuenta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategoryId && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('category')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedCategoryId && styles.activeFilterButtonText,
          ]}>
            {selectedCategory?.name || 'Categoría'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedDateRange?.startDate || selectedDateRange?.endDate) && styles.activeFilterButton,
          ]}
          onPress={() => {
            setTempDateRange(selectedDateRange || {});
            setActiveFilter('date');
          }}
        >
          <Text style={[
            styles.filterButtonText,
            (selectedDateRange?.startDate || selectedDateRange?.endDate) && styles.activeFilterButtonText,
          ]}>
            <Calendar size={14} color={selectedDateRange?.startDate ? '#FFFFFF' : '#4B5563'} />
            {' '}
            {selectedDateRange?.startDate && selectedDateRange?.endDate
              ? `${format(selectedDateRange.startDate, 'dd/MM')} - ${format(selectedDateRange.endDate, 'dd/MM')}`
              : 'Fechas'}
          </Text>
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={onClearAll}
        >
          <Text style={styles.clearAllText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={!!activeFilter}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveFilter(null)}
      >
        <View 
          style={styles.modalOverlay}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => setActiveFilter(null)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            {renderFilterContent()}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setActiveFilter(null)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  filterContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  closeButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  filterItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedFilterItem: {
    backgroundColor: '#EFF6FF',
  },
  filterItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  clearDateButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  applyDateButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  clearDateText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  applyDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  closeModalButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeModalText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
});
