import { Card, CardContent, Typography } from "@mui/material"

export default function MetricCard({ title, value }) {

 return (

  <Card
   sx={{
    borderRadius:3,
    boxShadow:"0 4px 20px rgba(0,0,0,0.3)"
   }}
  >

   <CardContent>

    <Typography variant="subtitle2" color="gray">
     {title}
    </Typography>

    <Typography variant="h4" sx={{mt:1}}>
     {value ?? 0}
    </Typography>

   </CardContent>

  </Card>

 )

}