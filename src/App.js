import React, { useState, useEffect } from 'react';

import './App.css';
import { forwardRef } from 'react';
import Grid from '@material-ui/core/Grid'

import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

let api = axios.create({
    baseURL: "https://127.0.0.1:5001/api/servers",
});
api.defaults.headers.post['Content-Type'] ='application/json';


function ValidateIP(ipaddress) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress);

}

function ValidateDateTimeStr(dt_string){
    // check full ISO-8601 datetime format
    let regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?$/i
    if (regex.test(dt_string)){
        return dt_string
    }
    return false
}

function CheckNewDateTimeStr(dt_string){
    let regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T(0?[0-9]|1[0-9]|2[0-3]):[0-9]+$/i
    if (regex.test(dt_string)) {
        let dt_string_new = dt_string+':00'
        if (ValidateDateTimeStr(dt_string_new)){
            return dt_string_new
        }
    }
    else
    {
        if (ValidateDateTimeStr(dt_string)){
            return dt_string
        }
        else{
            return false
        }
    }
    //return dt_string
}


function App() {
    const columns = [
        {title: "ID", field: "id", hidden: true},
        {title: "Name", field: "name",
            validate: rowData => rowData.Name === '' ? 'Name cannot be empty' : '', },
        {title: "Status", field: "status", type: "boolean"},
        {title: "Update Time", field: "updateTime", type: "string",
            editComponent: props => (
                <input type="datetime-local"
                       value={props.value}
                       onChange={e => props.onChange(e.target.value)}
                       pattern="/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?$/i" required
                />
            )
        },
        {title: "IP", field: "ip"},
        {title: "Speed", field: "speed", type: "numeric" }
    ];
    const [data, setData] = useState([]); //table data

  //for error handling
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

  useEffect(() => {
    api.get("/")
        .then(res => {
            console.log(res.data);
            for (let i = 0; i < res.data.length; i++) { /* pre-edit data */}
            setData(res.data)
         })
         .catch(error=>{
             console.log("Error")
         })
  }, [])

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = [];
    console.log(newData);
    console.log(oldData);
      if(newData.name === ""){
      errorList.push("Please enter valid name")
    }
    if(newData.ip === "" || ValidateIP(newData.ip) === false){
      errorList.push("Please enter valid ip")
    }
    if(newData.updateTime === "" || CheckNewDateTimeStr(newData.updateTime) === false){
      errorList.push("Please enter valid update time")
    }
    if(newData.speed === ""){
      errorList.push("Please enter valid speed")
    }
    if(newData.status === ""){
      errorList.push("Please enter valid status")
    }
    if(errorList.length < 1){
      api.post("/?name="+newData.name
          + "&oldName="+oldData.name
          + "&status="+newData.status
          + "&updateTime="+newData.updateTime
          + "&ip="+newData.ip
          + "&speed="+newData.speed)
      .then(res => {
        console.log(res);
        const dataUpdate = [...data];
        const index = oldData.tableData.id;
        dataUpdate[index] = newData;
        setData([...dataUpdate]);
        resolve()
        setIserror(false)
        setErrorMessages([])
      })
      .catch(error => { setErrorMessages(["Update failed! Server error"]); setIserror(true); resolve(); })
    }else { setErrorMessages(errorList); setIserror(true); resolve(); }
  }

  const handleRowAdd = (newData, resolve) => {
      let errorList = []
      console.log(newData);
      if(newData.name === ""){
          errorList.push("Please enter valid name")
      }
      if(newData.ip === "" || ValidateIP(newData.ip) === false){
          errorList.push("Please enter valid ip")
      }
      // edit datetime string
      newData.updateTime = CheckNewDateTimeStr(newData.updateTime)
      //console.log(newData);
      // check datetime
      if(newData.updateTime === "" || ValidateDateTimeStr(newData.updateTime) === false){
          errorList.push("Please enter valid update time")
      }
      if(newData.speed === ""){
          errorList.push("Please enter valid speed")
      }
      if(newData.status === ""){
          errorList.push("Please enter valid status")
      }
      if(errorList.length < 1){ //no error
          api.put("/?name="+newData.name
              + "&status="+newData.status
              + "&updateTime="+newData.updateTime
              + "&ip="+newData.ip
              + "&speed="+newData.speed
              )
              .then(res => {
                  newData.id = res.data.id;
                  console.log(newData)
                  let dataToAdd = [...data];
                  dataToAdd.push(newData);
                  setData(dataToAdd);
                  resolve()
                  setErrorMessages([])
                  setIserror(false)
              })
              .catch(error => {
                  setErrorMessages(["Cannot add data. Server error!", error]);
                  setIserror(true);
                  resolve();
              })
      }else{
          setErrorMessages(errorList);
          setIserror(true);
          resolve();
      }
  }

  const handleRowDelete = (oldData, resolve) => {
    api.delete("/?name="+oldData.name)
      .then(res => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve()
      })
      .catch(error => {
        setErrorMessages(["Delete failed! Server error"])
        setIserror(true)
        resolve()
      })
  }

  return (
    <div className="App">
      <Grid container spacing={1}>
          <Grid item xs={2}/>
          <Grid item xs={8}>
          <div>
            {iserror &&
              <Alert severity="error">
                  {errorMessages.map((msg, i) => {
                      return <div key={i}>{msg}</div>
                  })}
              </Alert>
            }
          </div>
            <MaterialTable
              title="Servers"
              columns={columns}
              data={data}
              icons={tableIcons}
              editable={{
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                      setTimeout(() => {
                      handleRowUpdate(newData, oldData, resolve);
                      }, 1000)
                  }),
                onRowAdd: (newData) =>
                  new Promise((resolve) => {
                      setTimeout(() => {
                          handleRowAdd(newData, resolve);
                      }, 1000)
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve) => {
                      setTimeout(() => {
                        handleRowDelete(oldData, resolve);
                      }, 1000)
                  }),
              }}
            />
          </Grid>
          <Grid item xs={3}/>
        </Grid>
    </div>
  );
}


export default App;
