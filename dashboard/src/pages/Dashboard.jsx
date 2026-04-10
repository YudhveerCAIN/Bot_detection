import { Grid, Box } from "@mui/material"

import MetricCard from "../components/MetricCard"
import SiteTrafficChart from "../components/Charts/SiteTrafficChart"
import BotPieChart from "../components/Charts/BotPieChart"
import ProbabilityChart from "../components/Charts/ProbabilityChart"
import RecentDetections from "../components/tables/RecentDetections"

export default function Dashboard({overview,sites,prob,recent}){

return(

<Box sx={{p:3}}>

<Grid container spacing={3}>

<Grid item xs={3}>
<MetricCard title="Total Sessions" value={overview.total_sessions}/>
</Grid>

<Grid item xs={3}>
<MetricCard title="Bots" value={overview.bots}/>
</Grid>

<Grid item xs={3}>
<MetricCard title="Humans" value={overview.humans}/>
</Grid>

<Grid item xs={3}>
<MetricCard title="Bot Rate" value={overview.bot_rate}/>
</Grid>

<Grid item xs={6}>
<SiteTrafficChart data={sites}/>
</Grid>

<Grid item xs={6}>
<BotPieChart humans={overview.humans} bots={overview.bots}/>
</Grid>

<Grid item xs={12}>
<ProbabilityChart data={prob}/>
</Grid>

<Grid item xs={12}>
<RecentDetections data={recent}/>
</Grid>

</Grid>

</Box>

)

}