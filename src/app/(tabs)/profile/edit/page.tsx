import Header from "@/components/base/header";
import { layout } from "@/constant/layout";
import { useTheme } from "@/hooks/use-theme";
import { ThemeType } from "@/types/theme-types";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image, Pressable, Alert, TextInput } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_STORAGE_KEY } from "@/components/auth/ui/sign-up-form";
import { router } from "expo-router";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
};

export default function EditProfile() {
  const { colorScheme } = useTheme();
  const styles = getStyles(colorScheme);
  const { top } = useSafeAreaInsets();

  const { control, handleSubmit, reset, setValue, watch } = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
    },
  });

  const avatar = watch("avatar");

  // get user data from async storage
  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (!userData) {
          console.warn("No user saved under", USER_STORAGE_KEY);
          return;
        }
        const user = JSON.parse(userData);
        reset({
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          address: user.address ?? "",
          avatar: user.avatar ?? "",
        });
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    })()
  }, [reset]);


  const onSubmit = async (data: ProfileForm) => {
    try {
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ ...existing, ...data }),
      );
      Alert.alert("Saved", "Profile updated");
      router.push("/(tabs)/profile/page");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Could not save your profile.");
    }
  };

  const getPhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) return;

    const resultCamera = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!resultCamera.canceled) {
      setValue("avatar", resultCamera.assets[0].uri, { shouldDirty: true });
    }
  };

  const getGallery = async () => {
    const resultGallery = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!resultGallery.canceled) {
      setValue("avatar", resultGallery.assets[0].uri, { shouldDirty: true });
    }
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    // Show action sheet for select camera or gallery
    Alert.alert(
      'Upload Avatar',
      "Choose an option",
      [
        {
          text: 'Take photo',
          onPress: getPhoto
        },
        {
          text: 'Choose from gallery',
          onPress: getGallery
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ],
      { cancelable: true }
    )

  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <Header />

      {/* Rounded avatar with border */}
      <View style={[styles.avatarContainer, { marginTop: top + 20 }]}>
        <View style={styles.avatarOverlay}>
          <Image source={avatar ? { uri: avatar } : require('@/assets/images/avatar.avif')} style={styles.avatar} />
          <Pressable style={styles.cameraButton} onPress={pickImage}>
            <Ionicons name="camera" size={24} color="black" />
          </Pressable>
        </View>

      </View>

      <View style={styles.inputContainer}>
        {/* Name get name from user data */}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

      </View>
      <Pressable style={styles.button} onPress={() => void handleSubmit(onSubmit)()}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>

    </SafeAreaView>
  )
}

const getStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === "dark" ? layout.colors.black : layout.colors.white,
  },
  avatarContainer: {
    position: 'absolute',
    top: '0%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: layout.colors.primary,
    backgroundColor: theme === "dark" ? layout.colors.black : layout.colors.white,
    alignSelf: "center",
  },
  avatarOverlay: {
    position: 'relative'
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 4,
    borderWidth: 1,
    borderColor: layout.colors.primary,
  },
  inputContainer: {
    marginTop: 64,
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 2,
    borderColor: layout.colors.primary,
    borderRadius: 8,
    padding: 14,
  },
  button: {
    position: "absolute",
    bottom: 12,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: layout.colors.primary,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});