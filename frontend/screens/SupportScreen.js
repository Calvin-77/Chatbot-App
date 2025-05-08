import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import Constants from 'expo-constants'

const PHONE_NUMBER = Constants.expoConfig.extra.PHONE_NUMBER

export default function SupportScreen() {
  const contactSupport = () => {
    let url = `https://wa.me/${PHONE_NUMBER}`
    Linking.openURL(url).catch(err => console.error("An error occurred", err))
  }

  return (
    <View style={tw`w-full h-full bg-[#E3E3E3] items-center justify-center`}>
      <Text style={tw`text-xl mb-5`}>
        Have any trouble using the app?
      </Text>
      <TouchableOpacity onPress={contactSupport}>
        <View style={tw`bg-[#0081E4] h-12 w-45 items-center justify-center rounded-lg`}>
          <Text style={tw`text-white text-xl`}>Contact Us</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})