import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { oficinas, divisas, citas } from '../services/api';

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  error: '#dc3545',
};

export default function AgendarScreen({ navigation, route }) {
  const [paso, setPaso] = useState(1);
  const [listaOficinas, setListaOficinas] = useState([]);
  const [listaDivisas, setListaDivisas] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    email_cliente: '',
    oficina_id: route.params?.oficinaId?.toString() || '',
    fecha: '',
    hora: '',
    divisa_origen: 'USD',
    divisa_destino: 'COP',
    monto: '',
    notas: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.oficina_id && formData.fecha) {
      cargarHorarios();
    }
  }, [formData.oficina_id, formData.fecha]);

  const cargarDatos = async () => {
    try {
      const [oficinasData, divisasData] = await Promise.all([
        oficinas.obtenerTodas(),
        divisas.obtenerTodas()
      ]);
      setListaOficinas(oficinasData);
      setListaDivisas(divisasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
    setLoading(false);
  };

  const cargarHorarios = async () => {
    try {
      const data = await citas.obtenerDisponibilidad(formData.oficina_id, formData.fecha);
      setHorariosDisponibles(data.horarios);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setHorariosDisponibles([]);
    }
  };

  const handleSubmit = async () => {
    setEnviando(true);

    try {
      const resultado = await citas.crear(formData);
      navigation.replace('CitaConfirmada', {
        cita: resultado.cita,
        destino: formData.divisa_destino
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al agendar la cita');
    }
    setEnviando(false);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.step}>
            <View style={[
              styles.stepNumber,
              paso >= step && styles.stepNumberActive
            ]}>
              <Text style={[
                styles.stepNumberText,
                paso >= step && styles.stepNumberTextActive
              ]}>{step}</Text>
            </View>
            <Text style={styles.stepLabel}>
              {step === 1 ? 'Datos' : step === 2 ? 'Fecha' : 'Operación'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        {/* Paso 1: Datos Personales */}
        {paso === 1 && (
          <View>
            <Text style={styles.cardTitle}>Datos de Contacto</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre_cliente}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nombre_cliente: text }))}
                placeholder="Ingrese su nombre"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono *</Text>
              <TextInput
                style={styles.input}
                value={formData.telefono_cliente}
                onChangeText={(text) => setFormData(prev => ({ ...prev, telefono_cliente: text }))}
                placeholder="+57 300 123 4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email_cliente}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email_cliente: text }))}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, (!formData.nombre_cliente || !formData.telefono_cliente) && styles.buttonDisabled]}
              onPress={() => setPaso(2)}
              disabled={!formData.nombre_cliente || !formData.telefono_cliente}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paso 2: Fecha y Hora */}
        {paso === 2 && (
          <View>
            <Text style={styles.cardTitle}>Selecciona Fecha y Hora</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Oficina *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.oficina_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, oficina_id: value, hora: '' }))}
                >
                  <Picker.Item label="Seleccione una oficina" value="" />
                  {listaOficinas.map(o => (
                    <Picker.Item key={o.id} label={o.nombre} value={o.id.toString()} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha *</Text>
              <TextInput
                style={styles.input}
                value={formData.fecha}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fecha: text, hora: '' }))}
                placeholder="YYYY-MM-DD"
              />
              <Text style={styles.hint}>Formato: 2024-01-15</Text>
            </View>

            {formData.fecha && formData.oficina_id && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Horario Disponible *</Text>
                {horariosDisponibles.length > 0 ? (
                  <View style={styles.timeSlots}>
                    {horariosDisponibles.map(hora => (
                      <TouchableOpacity
                        key={hora}
                        style={[
                          styles.timeSlot,
                          formData.hora === hora && styles.timeSlotSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, hora }))}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          formData.hora === hora && styles.timeSlotTextSelected
                        ]}>{hora}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noHorarios}>No hay horarios disponibles</Text>
                )}
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setPaso(1)}>
                <Text style={styles.outlineButtonText}>Atrás</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flex1, (!formData.oficina_id || !formData.fecha || !formData.hora) && styles.buttonDisabled]}
                onPress={() => setPaso(3)}
                disabled={!formData.oficina_id || !formData.fecha || !formData.hora}
              >
                <Text style={styles.primaryButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Paso 3: Operación */}
        {paso === 3 && (
          <View>
            <Text style={styles.cardTitle}>Detalles de la Operación</Text>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>Divisa que Entrega</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.divisa_origen}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, divisa_origen: value }))}
                  >
                    {listaDivisas.map(d => (
                      <Picker.Item key={d.codigo} label={d.codigo} value={d.codigo} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>Divisa que Recibe</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.divisa_destino}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, divisa_destino: value }))}
                  >
                    {listaDivisas.map(d => (
                      <Picker.Item key={d.codigo} label={d.codigo} value={d.codigo} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Monto Aproximado *</Text>
              <TextInput
                style={styles.input}
                value={formData.monto}
                onChangeText={(text) => setFormData(prev => ({ ...prev, monto: text }))}
                placeholder="Ingrese el monto"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas Adicionales</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.notas}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notas: text }))}
                placeholder="Cualquier información adicional..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Resumen */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Nombre: </Text>{formData.nombre_cliente}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Oficina: </Text>
                {listaOficinas.find(o => o.id.toString() === formData.oficina_id)?.nombre}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Fecha: </Text>{formData.fecha} a las {formData.hora}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Operación: </Text>
                {formData.monto} {formData.divisa_origen} → {formData.divisa_destino}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setPaso(2)}>
                <Text style={styles.outlineButtonText}>Atrás</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flex1, (!formData.monto || enviando) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!formData.monto || enviando}
              >
                <Text style={styles.primaryButtonText}>
                  {enviando ? 'Agendando...' : 'Confirmar Cita'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 30,
  },
  step: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stepNumberActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  stepNumberTextActive: {
    color: COLORS.secondary,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 5,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 3,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: COLORS.text,
  },
  timeSlotTextSelected: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  noHorarios: {
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
