import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { divisas } from '../services/api';

const COLORS = {
  primary: '#D4AF37',
  primaryDark: '#B8960C',
  secondary: '#1a1a2e',
  accent: '#16213e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  success: '#28a745',
};

export default function HomeScreen({ navigation }) {
  const [listaDivisas, setListaDivisas] = useState([]);
  const [tasas, setTasas] = useState([]);
  const [origen, setOrigen] = useState('USD');
  const [destino, setDestino] = useState('COP');
  const [monto, setMonto] = useState('100');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (monto && parseFloat(monto) > 0) {
      convertir();
    }
  }, [monto, origen, destino]);

  const cargarDatos = async () => {
    try {
      const [divisasData, tasasData] = await Promise.all([
        divisas.obtenerTodas(),
        divisas.obtenerTasas()
      ]);
      setListaDivisas(divisasData);
      setTasas(tasasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
    setLoading(false);
  };

  const convertir = async () => {
    if (!monto || parseFloat(monto) <= 0) return;

    try {
      const result = await divisas.convertir(origen, destino, monto, 'venta');
      setResultado(result);
    } catch (error) {
      console.error('Error al convertir:', error);
      setResultado(null);
    }
  };

  const intercambiar = () => {
    setOrigen(destino);
    setDestino(origen);
    setResultado(null);
  };

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
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
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🥊</Text>
        <Text style={styles.heroTitle}>Bienvenido</Text>
        <Text style={styles.heroSubtitle}>
          Tu casa de cambio de confianza en Barranquilla
        </Text>
      </View>

      {/* Converter */}
      <View style={styles.converter}>
        <Text style={styles.converterTitle}>Simulador de Cambio</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tienes</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              placeholder="Cantidad"
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={origen}
                onValueChange={setOrigen}
                style={styles.picker}
              >
                {listaDivisas.map(d => (
                  <Picker.Item key={d.codigo} label={d.codigo} value={d.codigo} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.swapButton} onPress={intercambiar}>
          <Text style={styles.swapButtonText}>⇅</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recibes</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={resultado ? formatearNumero(resultado.monto_convertido) : '---'}
              editable={false}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={destino}
                onValueChange={setDestino}
                style={styles.picker}
              >
                {listaDivisas.map(d => (
                  <Picker.Item key={d.codigo} label={d.codigo} value={d.codigo} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {resultado && (
          <View style={styles.resultBox}>
            <Text style={styles.resultAmount}>
              {formatearNumero(resultado.monto_convertido)} {destino}
            </Text>
            <Text style={styles.resultRate}>
              Tasa: 1 {origen} = {formatearNumero(resultado.tasa_aplicada)} {destino}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Agendar')}
        >
          <Text style={styles.primaryButtonText}>Agendar Cambio en Oficina</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Rates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasas del Día</Text>
        {tasas.slice(0, 4).map((tasa, index) => (
          <View key={index} style={styles.rateCard}>
            <Text style={styles.ratePair}>
              {tasa.divisa_origen} → {tasa.divisa_destino}
            </Text>
            <View style={styles.rateValues}>
              <Text style={styles.rateLabel}>
                Compra: <Text style={styles.rateValue}>{formatearNumero(tasa.tasa_compra)}</Text>
              </Text>
              <Text style={styles.rateLabel}>
                Venta: <Text style={styles.rateValue}>{formatearNumero(tasa.tasa_venta)}</Text>
              </Text>
            </View>
          </View>
        ))}
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
  hero: {
    backgroundColor: COLORS.secondary,
    padding: 30,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  converter: {
    backgroundColor: COLORS.white,
    margin: 15,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  converterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
  },
  pickerContainer: {
    width: 100,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  swapButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  swapButtonText: {
    fontSize: 18,
    color: COLORS.secondary,
  },
  resultBox: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resultRate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  rateCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ratePair: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  rateValues: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  rateValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
});
