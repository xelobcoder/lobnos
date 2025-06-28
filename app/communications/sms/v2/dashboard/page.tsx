"use client";
import React from "react";
import {
     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const lineData = [
     { name: "Jan", uv: 400, pv: 240 },
     { name: "Feb", uv: 300, pv: 139 },
     { name: "Mar", uv: 200, pv: 980 },
     { name: "Apr", uv: 278, pv: 390 },
     { name: "May", uv: 189, pv: 480 },
     { name: "Jun", uv: 239, pv: 380 },
];

const barData = [
     { name: "Mon", sent: 300, received: 456 },
     { name: "Tue", sent: 145, received: 230 },
     { name: "Wed", sent: 200, received: 345 },
     { name: "Thu", sent: 278, received: 200 },
     { name: "Fri", sent: 189, received: 278 },
];

const pieData = [
     { name: "Delivered", value: 400 },
     { name: "Failed", value: 100 },
     { name: "Pending", value: 50 },
];

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

export default function SmsDashboard() {
  return (
    <div style={{ padding: 32, background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 40, letterSpacing: 1, color: '#2a4365' }}>SMS Dashboard</h1>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Line Chart Card */}
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500, height: 340, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, color: '#2b6cb0', marginBottom: 12 }}>Monthly SMS Traffic</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip contentStyle={{ borderRadius: 8, background: '#f7fafc', border: '1px solid #cbd5e1' }} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="uv" stroke="#4f46e5" strokeWidth={3} name="Sent" fillOpacity={1} fill="url(#colorUv)" dot={{ r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="pv" stroke="#10b981" strokeWidth={3} name="Received" fillOpacity={1} fill="url(#colorPv)" dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Bar Chart Card */}
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500, height: 340, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, color: '#2b6cb0', marginBottom: 12 }}>Weekly SMS Summary</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip contentStyle={{ borderRadius: 8, background: '#f7fafc', border: '1px solid #cbd5e1' }} />
              <Legend iconType="circle" />
              <Bar dataKey="sent" fill="#6366f1" name="Sent" radius={[8, 8, 0, 0]} barSize={28} />
              <Bar dataKey="received" fill="#34d399" name="Received" radius={[8, 8, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart Card */}
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500, height: 340, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, color: '#2b6cb0', marginBottom: 12 }}>Delivery Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                isAnimationActive
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, background: '#f7fafc', border: '1px solid #cbd5e1' }} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}