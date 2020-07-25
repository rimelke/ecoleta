import React, { useEffect, useState } from 'react'
import { View, ImageBackground, Image, StyleSheet, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Select from 'react-native-picker-select'
import axios from 'axios'

interface IBGEUFRes {
    sigla: string
}

interface IBGECityRes {
    nome: string
}

const Home = () => {
    const [ufs, setUfs] = useState<string[]>([])
	const [cities, setCities] = useState<string[]>([]) 
    const [selectedUf, setSelectedUf] = useState('')
    const [selectedCity, setSelectedCity] = useState('')

	const navigation = useNavigation()
	
    useEffect(() => {
        axios.get<IBGEUFRes[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla).sort()
            setUfs(ufInitials)
        })
    }, [])

	function handleNavigateToPoints() {
		navigation.navigate('Points', {city: selectedCity, uf: selectedUf})
	}

	function handleSelectUf(uf: string) {
        if (uf === '') {return}
        setSelectedUf(uf)
        axios.get<IBGECityRes[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`).then(res => {
            const parsedCities = res.data.map(city => city.nome)
            setCities(parsedCities)
        })
	}
	
	function handleSelectCity(city) {
		if (city === '') {return}
		setSelectedCity(city)
	}

    return (
        <ImageBackground
            source={require('../../assets/home-background.png')}
            style={styles.container}
            imageStyle={{width: 274, height: 368}}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')}/>
                <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            </View>

            <View style={styles.footer}>
                <Select
					onValueChange={handleSelectUf}
					items={ufs.map(uf => ({label: uf, value: uf, key: uf}))}
					placeholder={{label: 'Selecione uma UF', value: '', color: '#C7C7C7'}}
					useNativeAndroidPickerStyle={false}
					style={{inputAndroid: styles.input, inputIOS: styles.input}}
				/>

				<Select
					onValueChange={handleSelectCity}
					items={cities.map(city => ({label: city, value: city, key: city}))}
					placeholder={{label: 'Selecione uma cidade', value: '', color: '#C7C7C7'}}
					useNativeAndroidPickerStyle={false}
					style={{inputAndroid: styles.input, inputIOS: styles.input}}
				/>

                <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Icon name="log-in" color="#FFF" size={20} />
                    </View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
	  backgroundColor: 'rgba(0, 0, 0, 0.1)',
	  borderTopLeftRadius: 10,
	  borderBottomLeftRadius: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
});

export default Home