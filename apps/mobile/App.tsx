import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { v4 as uuid } from "uuid";

const Stack = createNativeStackNavigator();

type Severity = "low" | "medium" | "high" | "critical";

interface SubmitResult {
  incidentId: string;
  status: string;
  submittedAt: string;
}

interface ReportHeaderProps {
  title: string;
}

function ReportHeader({ title }: ReportHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}

type SelectedAsset = ImagePicker.ImagePickerAsset & { base64?: string };

const severityOptions: Severity[] = ["low", "medium", "high", "critical"];

const resolveApiBaseUrl = (): string | undefined => {
  if (typeof process === "undefined") {
    return undefined;
  }

  const rawValue: unknown = process.env?.EXPO_PUBLIC_API_BASE_URL;
  return typeof rawValue === "string" && rawValue.length > 0
    ? rawValue
    : undefined;
};

const API_BASE_URL = resolveApiBaseUrl() ?? "http://localhost:4000";
const PRIMARY_COLOR = "#b4ce93";
const COLORS = {
  background: "#f9fafb",
  surface: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#4b5563",
  muted: "#6b7280",
  border: "#e5e7eb",
  danger: "#b91c1c",
  successSurface: "#ecfdf3",
  successText: "#14532d",
};

function ReportIncidentScreen() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [photo, setPhoto] = useState<SelectedAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const ensureFingerprint = async () => {
      try {
        const existing = await AsyncStorage.getItem("deviceFingerprint");
        if (existing) {
          setFingerprint(existing);
          return;
        }
        const newId = uuid();
        await AsyncStorage.setItem("deviceFingerprint", newId);
        setFingerprint(newId);
      } catch (storageError) {
        console.warn("Unable to access AsyncStorage", storageError);
      }
    };

    void ensureFingerprint();
  }, []);

  const latitudeNumber = useMemo(() => {
    const parsed = Number(latitude.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [latitude]);

  const longitudeNumber = useMemo(() => {
    const parsed = Number(longitude.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [longitude]);

  const resetForm = () => {
    setType("");
    setDescription("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setSeverity("medium");
    setPhoto(null);
  };

  const handlePickPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to attach media.",
        );
        return;
      }

      const resultPicker = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (resultPicker.canceled || !resultPicker.assets.length) {
        return;
      }

      const asset = resultPicker.assets[0];
      setPhoto({
        ...asset,
        base64: asset.base64 ?? undefined,
      });
    } catch (pickerError) {
      console.error("Image picker error", pickerError);
      Alert.alert("Unable to select image", "Please try again later.");
    }
  };

  const submitIncident = async () => {
    if (!type.trim()) {
      Alert.alert("Missing information", "Please provide an incident type.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/public/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(fingerprint ? { "x-device-fingerprint": fingerprint } : {}),
        },
        body: JSON.stringify({
          type: type.trim(),
          description: description.trim() || undefined,
          address: address.trim() || undefined,
          severity,
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "You are submitting too quickly. Please wait a moment and try again.",
          );
        }

        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          payload?.message ?? "Unable to submit incident. Please try again.",
        );
      }

      const data = (await response.json()) as SubmitResult;
      setResult(data);
      resetForm();

      if (!fingerprint) {
        const newId = uuid();
        await AsyncStorage.setItem("deviceFingerprint", newId);
        setFingerprint(newId);
      }
    } catch (submissionError) {
      console.error("Incident submission failed", submissionError);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Anonymous Incident Report</Text>
        <Text style={styles.subheading}>
          Provide as much detail as possible. Dispatchers will review your
          report immediately.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Incident type *</Text>
          <TextInput
            value={type}
            onChangeText={setType}
            placeholder="e.g. Residential fire"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="sentences"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is happening? Include injuries, hazards, etc."
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Severity</Text>
          <View style={styles.pillGroup}>
            {severityOptions.map((option) => {
              const isActive = option === severity;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSeverity(option)}
                  style={[styles.pill, isActive && styles.pillActive]}
                >
                  <Text
                    style={[styles.pillText, isActive && styles.pillTextActive]}
                  >
                    {option.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Nearest address or landmark"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="sentences"
          />
        </View>

        <View style={[styles.section, styles.coordinates]}>
          <View style={styles.coordinateField}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 14.5995"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.coordinateField}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 120.9842"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Optional photo</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => {
              void handlePickPhoto();
            }}
          >
            <Text style={styles.photoButtonText}>
              {photo ? "Replace photo" : "Add photo"}
            </Text>
          </TouchableOpacity>
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <Text style={styles.photoHint}>
                Photo attached locally. Upload pipeline coming in a future task.
              </Text>
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {result ? (
          <View style={styles.successContainer}>
            <Text style={styles.successHeading}>Incident submitted</Text>
            <Text style={styles.successText}>
              Reference ID: {result.incidentId}
            </Text>
            <Text style={styles.successText}>Status: {result.status}</Text>
            <Text style={styles.successText}>
              Submitted at: {new Date(result.submittedAt).toLocaleString()}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={() => {
            void submitIncident();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <Text style={styles.submitButtonText}>Submit report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            header: ({ options, route }) => (
              <ReportHeader
                title={
                  typeof options.title === "string" && options.title.length
                    ? options.title
                    : route.name
                }
              />
            ),
          }}
        >
          <Stack.Screen
            name="ReportIncident"
            component={ReportIncidentScreen}
            options={{ title: "ResQ-Link" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: {
    height: 120,
    lineHeight: 20,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pillActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  pillTextActive: {
    color: COLORS.textPrimary,
  },
  coordinates: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateField: {
    flex: 1,
  },
  photoButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  photoButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  photoPreviewContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.surface,
  },
  photoHint: {
    padding: 8,
    fontSize: 12,
    color: COLORS.muted,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: COLORS.successSurface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  successHeading: {
    color: COLORS.successText,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  successText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  headerSafeArea: {
    backgroundColor: PRIMARY_COLOR,
  },
  headerContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: PRIMARY_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#9bb57a",
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});
