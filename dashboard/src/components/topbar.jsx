import { AppBar, Toolbar, Typography } from "@mui/material"

export default function Topbar() {

  return (

    <AppBar position="static">

      <Toolbar>

        <Typography variant="h6">
          Bot Detection Dashboard
        </Typography>

      </Toolbar>

    </AppBar>

  )

}