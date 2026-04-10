export default function RecentDetections({ data }) {

 return (

  <table style={{ width:"100%" }}>

   <thead>
    <tr>
     <th>Session</th>
     <th>Prediction</th>
     <th>Bot Probability</th>
    </tr>
   </thead>

   <tbody>

    {data.map(row => (

     <tr key={row.session_id}>

      <td>{row.session_id}</td>

      <td>
       {row.prediction === 1 ? "BOT" : "HUMAN"}
      </td>

      <td>{row.bot_probability}</td>

     </tr>

    ))}

   </tbody>

  </table>

 )

}