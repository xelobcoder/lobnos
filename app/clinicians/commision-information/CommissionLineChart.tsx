"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { currencyFormatter } from "../../../components/Auth/customFetch";

const COLOR_ACCENT = "#198754"; // Excel green, matches main analytics page
const COLOR_BORDER = "var(--bs-border-color)";
const COLOR_TEXT_MUTED = "var(--bs-secondary-color)";

export interface CommissionChartData {
	service_date: string;
	commission_earned: string;
}

export default function CommissionLineChart({ data }: { data: CommissionChartData[] }) {
	const chartData = data.map(item => ({
		...item,
		commission_earned: parseFloat(item.commission_earned),
		dateLabel: dayjs(item.service_date).format("YYYY-MM-DD"),
	}));

  return (
	<div style={{ width: "100%", height: 320, marginBottom: 32 }}>
	  <ResponsiveContainer>
		<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
		  <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
		  <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
		  <YAxis
			allowDecimals={false}
			tick={{ fontSize: 12 }}
			tickFormatter={(value) => currencyFormatter.format(value)}
		  />
		  <Tooltip
			content={({ active, payload }) => {
			  if (active && payload && payload.length) {
				const entry = payload[0].payload;
				return (
				  <div style={{
					background: "var(--bs-body-bg)", border: `1px solid ${COLOR_BORDER}`,
					borderRadius: 8, padding: 12, minWidth: 120, fontSize: 13, color: "var(--bs-body-color)"
				  }}>
					<div style={{ marginBottom: 6 }}>
					  <span style={{ color: COLOR_TEXT_MUTED, fontSize: 12 }}>Date</span>
					  <div style={{ fontWeight: 600 }}>{entry.dateLabel}</div>
					</div>
					<div>
					  <span style={{ color: COLOR_TEXT_MUTED, fontSize: 12 }}>Commission</span>
					  <div style={{ fontWeight: 600, color: COLOR_ACCENT }}>{currencyFormatter.format(entry.commission_earned)}</div>
					</div>
				  </div>
				);
			  }
			  return null;
			}}
			cursor={{ fill: 'var(--bs-tertiary-bg)' }}
		  />
		  <Legend />
		  <Line type="monotone" dataKey="commission_earned" name="Commission Earned" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
		</LineChart>
	  </ResponsiveContainer>
	</div>
  );
}
