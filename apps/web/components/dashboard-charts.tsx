"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatMoneyMinor } from "@/lib/format-money";

const palette = ["#0B1B33", "#B8863B", "#0F5132", "#A23E1D", "#2C5EAA"];

interface CashPoint {
  month: string;
  actual: number;
  projected: number;
}

interface ExpensePoint {
  name: string;
  value: number;
}

export function CashFlowChart({ data, currency = "KES" }: { data: CashPoint[]; currency?: string }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#D9DEE6" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${Number(value) / 1000000}m`}
            tick={{ fill: "#5B6472", fontSize: 12 }}
          />
          <Tooltip formatter={(value) => formatMoneyMinor(Number(value) * 100, currency)} labelStyle={{ color: "#0B1B33" }} />
          <Legend iconType="line" />
          <Area type="monotone" dataKey="actual" name="Actual" stroke="#0B1B33" fill="#0B1B33" fillOpacity={0.12} strokeWidth={2} />
          <Area
            type="monotone"
            dataKey="projected"
            name="Projected"
            stroke="#B8863B"
            fill="#B8863B"
            fillOpacity={0.12}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseDonut({ data, currency = "KES" }: { data: ExpensePoint[]; currency?: string }) {
  return (
    <div className="h-[266px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoneyMinor(Number(value) * 100, currency)} />
          <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitComparison({ data, currency = "KES" }: { data: any[]; currency?: string }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#D9DEE6" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <Tooltip formatter={(value) => `${currency} ${Number(value).toLocaleString()}`} />
          <Bar dataKey="revenue" name="Revenue" fill="#0F5132" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#A23E1D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { LineChart, Line } from "recharts";

export function TrendLineChart({ data, currency = "KES" }: { data: any[]; currency?: string }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#D9DEE6" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <Tooltip formatter={(value) => `${currency} ${Number(value).toLocaleString()}`} />
          <Legend iconType="circle" />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0F5132" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="expense" name="Expenses" stroke="#A23E1D" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
