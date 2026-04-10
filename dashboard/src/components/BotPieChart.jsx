import {
 PieChart,
 Pie,
 Tooltip,
 ResponsiveContainer
} from "recharts"

export default function BotPieChart({ humans, bots }) {

 const data = [
  { name: "Humans", value: humans },
  { name: "Bots", value: bots }
 ]

 return (

  <ResponsiveContainer width="100%" height={300}>

   <PieChart>

    <Pie
     data={data}
     dataKey="value"
     outerRadius={100}
     label
    />

    <Tooltip />

   </PieChart>

  </ResponsiveContainer>

 )

}