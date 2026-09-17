'use client';

import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';

type DispatchOrder = {
     id: number;
     patient_name?: string;
     latitude: number;
     longitude: number;
     status: string;
};

export default function DispatchMap({ orders }: { orders: DispatchOrder[] }) {
     const withCoordinates = orders.filter((order) => order.latitude && order.longitude);

     if (withCoordinates.length === 0) return null;

     const center: [number, number] = [withCoordinates[0].latitude, withCoordinates[0].longitude];

     return (
          <MapContainer center={center} zoom={11} style={{ width: '100%', height: '360px', borderRadius: '6px' }}>
               <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
               {withCoordinates.map((order) => (
                    <LeafletMarker key={order.id} position={[order.latitude, order.longitude]}>
                         <Popup>#{order.id} — {order.patient_name || 'Patient'} — {order.status}</Popup>
                    </LeafletMarker>
               ))}
          </MapContainer>
     );
}