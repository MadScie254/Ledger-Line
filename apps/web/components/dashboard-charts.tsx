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

export function CashFlowChart({ data }: { data: CashPoint[] }) {
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
          <Tooltip formatter={(value) => currency(Number(value) * 100)} labelStyle={{ color: "#0B1B33" }} />
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

export function ExpenseDonut({ data }: { data: ExpensePoint[] }) {
  return (
    <div className="h-[266px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => currency(Number(value) * 100)} />
          <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitComparison() {
  const data = [
    { label: "Prior", income: 1840, expense: 1320 },
    { label: "Current", income: 1942, expense: 1665 }
  ];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#D9DEE6" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5B6472", fontSize: 12 }} />
          <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString("en-KE")}k`} />
          <Bar dataKey="income" name="Income" fill="#0F5132" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#A23E1D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function currency(amountMinor: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2
  }).format(amountMinor / 100);
}
