import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer
} from "recharts"

export default function SiteTrafficChart({ data }) {

 return (

  <ResponsiveContainer width="100%" height={300}>

   <BarChart data={data}>

    <XAxis dataKey="_id" />
    <YAxis />
    <Tooltip />

    <Bar dataKey="sessions" />

   </BarChart>

  </ResponsiveContainer>

 )

}