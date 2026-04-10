import { Drawer, List, ListItemButton, ListItemText } from "@mui/material"

export default function Sidebar() {

  return (
    <Drawer variant="permanent">

      <List sx={{width:220}}>

        <ListItemButton>
          <ListItemText primary="Overview"/>
        </ListItemButton>

        <ListItemButton>
          <ListItemText primary="Sites"/>
        </ListItemButton>

        <ListItemButton>
          <ListItemText primary="Live Sessions"/>
        </ListItemButton>

        <ListItemButton>
          <ListItemText primary="Detections"/>
        </ListItemButton>

      </List>

    </Drawer>
  )

}