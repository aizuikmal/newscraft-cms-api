import axios from 'axios'

const NewslightSeries = async (req, res) => {
  const { sids } = req.query

  const pl = {
    secret: 'F9TxxxxxxxxxBxxxxxxxxxi1y',
    sid: sids.split(',')
  }

//   console.log(pl)

  const ret = await axios.post(`https://xxxxxxxxx/reports/payments/sid_referral_count_revenue`, pl)

  res.json({ status: 'ok', data: ret.data?.counter ? ret.data.counter : {} })

}

export default NewslightSeries

// $sids_string = qs('sid');
// $sids_arr = explode(',',$sids_string);

// $data = array("secret" => "F9TcGdY!5*qVA5hBq33i1y", "sid" => $sids_arr);
// $data_string = json_encode($data);

// $ch = curl_init('https://xxxxxxxxx/reports/payments/sid_referral_count_revenue');
// curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
// curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_HTTPHEADER, array(
//     'Content-Type: application/json',
//     'Content-Length: ' . strlen($data_string))
// );
