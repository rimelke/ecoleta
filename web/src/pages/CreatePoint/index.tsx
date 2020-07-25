import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, Marker, TileLayer} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'

import Dropzone from '../../components/Dropzone'
import logo from '../../assets/logo.svg'
import './styles.css'

interface Item {
    id: number,
    title: string,
    image: string,
    image_url: string
}

interface IBGEUFRes {
    sigla: string
}

interface IBGECityRes {
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([]) 

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    const [selectedUf, setSelectedUf] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude} = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUFRes[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla).sort()
            setUfs(ufInitials)
        })
    }, [])

    function handleSelectUf(evt: ChangeEvent<HTMLSelectElement>) {
        const uf = evt.target.value
        if (uf === '') {return}
        setSelectedUf(uf)
        axios.get<IBGECityRes[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`).then(res => {
            const parsedCities = res.data.map(city => city.nome)
            setCities(parsedCities)
        })
    }

    function handleSelectCity(evt: ChangeEvent<HTMLSelectElement>) {
        const city = evt.target.value
        setSelectedCity(city)
    }

    function handleMapClick(evt: LeafletMouseEvent) {
        setSelectedPosition([
            evt.latlng.lat,
            evt.latlng.lng
        ])
    }

    function handleFormChange(evt: ChangeEvent<HTMLInputElement>) {
        setFormData({...formData, [evt.target.name]: evt.target.value})
    }

    function handleItemClick(id: number) {
        if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(item => item !== id))
        else setSelectedItems([...selectedItems, id])
    }

    async function handleFormSubmit(evt: FormEvent) {
        evt.preventDefault()
        const {name, email, whatsapp} = formData
        const city = selectedCity
        const uf = selectedUf
        const items = selectedItems
        const [latitude, longitude] = selectedPosition

        const data = new FormData()

        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))
        if (selectedFile) data.append('image', selectedFile)
        else {return}

        await api.post('/points', data)

        alert('Ponto criado!')

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
   
                <Link to="/">
                    <FiArrowLeft />
                    Voltar
                </Link>
            </header>

            <form onSubmit={handleFormSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileDrop={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" required onChange={handleFormChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" required onChange={handleFormChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" required onChange={handleFormChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={14} onClick={handleMapClick}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" required onChange={handleSelectUf}>
                                <option value="">Selecione uma UF</option>
                                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" required onChange={handleSelectCity}>
                                <option value="">Selecione uma cidade</option>
                                {cities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint