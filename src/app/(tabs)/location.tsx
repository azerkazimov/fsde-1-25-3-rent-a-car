import { View, Text, Platform, StyleSheet, useColorScheme } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect, useState } from "react";
import { ThemeType } from "@/types/theme-types";
import { useTheme } from "@/hooks/use-theme";

export default function LocationScreen() {
  const { colorScheme } = useTheme();
  const styles = getStyles(colorScheme);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  useEffect(() => {
    async function getCurrentLocation() {
      // if (Platform.OS === "android" && !Device.isDevice) {
      //   setErrorMsg("Oops, this will not work on Snack in an Android emulator. Try it on your device!");
      //   return;
      // }

      let { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }
    getCurrentLocation();
  }, [])

  if (!location) {
    return <Text>Loading...</Text>
  }

  if (errorMsg) {
    return <Text>{errorMsg}</Text>
  }



  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        // showsCompass={true}
        // showsScale={true}
        showsTraffic={true}
        showsBuildings={true}
        showsPointsOfInterests
      >
        <Marker
          coordinate={{
            latitude: 40.41512538052298,
            longitude: 50.145118565236935,
          }}
        />

      </MapView>
    </View>
  );
}

const getStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});