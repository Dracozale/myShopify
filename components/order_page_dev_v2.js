
import React,{ useState, useEffect, useCallback} from 'react'
import styled from 'styled-components'
import { useTable, usePagination, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce  } from 'react-table'
import { DataTable, Pagination, Select, TextField, Filters,  TextStyle, Card, IndexTable, useIndexResourceState,Modal,TextContainer,Button,Page} from '@shopify/polaris';
import Tracking from '../components/tracking';
import Pickup from '../components/pickup_request';
//import Shopify, { DataType } from '@shopify/shopify-api';
import { colors } from '@material-ui/core';
//import makeData from './makeData'
import throttle from "lodash/throttle";
import cloneDeep from "lodash/cloneDeep";
import store from 'store-js';
import { Mutation } from '@apollo/react-components';


const Styles = styled.div`
 font-family: sans-serif;
  padding: 1rem;
  table {
    overflow-x:auto;
    
    border-collapse: collapse;
    border-spacing: 0.5;
    width: 100%;
    border: 1px solid #ddd;
  
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }

      tr:nth-child(even) {
        background-color: #e0e0e0;
      }
    }

    th,
    td {
        margin: 0;
        padding: 0.5rem;
        border-bottom: 1px solid black;
        border-right: 1px solid black;
       
          :last-child {
            border-right: 0;
        }      
      },

  
    }
  .pagination {
    padding: 0.5rem;
  }
`



function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)
  
  return (
    <span>
      {' '}
      <input class="input"
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search`}
        
      />
    </span>
  )
}

function Table({ columns, data }) {

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0},
      initialState: { pageSize: 10},
    }, 
    useGlobalFilter,    
    usePagination
  )
  console.log("page total " + pageSize)

  // Render the UI for your table
  return (
    <>
    
      <table {...getTableProps()}
      border={1}
      style={{ borderCollapse: "collapse", width: "100%" }}
      >
      <thead>
          <tr>
          
            <th
              colSpan={100}
              Styles={{
                textAlign: 'center',
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                //globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th style={{background: '#df1e34', color: 'white'}}
                  {...column.getHeaderProps()}>{column.render('Header')}
                 
                </th>
              ))}
            </tr>
          ))}
         
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
               
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                // return    <td type='input'>asd</td>
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <br/>
      <div className="pagination">
        <button class="btn button3" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button class="btn button3" onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button class="btn button3" onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button class="btn button3"onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input class="input"
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        
        
        <select class="btn button3"
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default function App(shopdetail) {
   
  //#region print label modal
    const [base64, setbase64] = useState([]); 
    const [active, setActive] = useState(false);
    const handleChangemodal = useCallback((e) =>{ 
      console.log("e data",e); 
      
      //getOrderlist(shopdet.shop.name);
     window.location.reload(true);
      setActive(!active), [active]
    });

  var bin = base64;
  var labeltorpint;
  //console.log("base64: ",bin);
  //console.log('File Size:', Math.round(bin.length / 1024), 'KB');
  const meta = 'data:application/pdf;base64,';
  const data = meta + base64.toString();  
  
  const img = 'https://www.pos.com.my/media/wysiwyg/Rectangle_32_1.png';

  if (base64 == '') {
    labeltorpint = img
  } else {
    labeltorpint = data;
  }
  //#endregion
  
  //#region button and Checkbox
  // var raw = {shopname:shopdet.shop.name,orderid:selectedid}
    var shopdet = shopdetail.shopdetail;
    console.log(shopdet);
    console.log(shopdetail);

    var shopname = shopdetail.shopdetail;
    var shopd = shopname.shop;
    var shopnew = shopd.domains[0].url.replace(/(^\w+:|^)\/\//,'');
    console.log('jom '+ JSON.stringify(shopnew));
    getOrderlist(shopnew);
    const [orders, setOrders] = React.useState([]);
    const [selectedid, setSelectedid] = useState([]);

    const CheckboxCell = ({ row }) => {
        const handleChange = event => {
          row.original.approved = event.target.checked;
        };
        const defaultChecked = !!row.original.approved;
        const chkbox = !!row.original.checkstat;
        console.log("c " +chkbox)
        return (
          <input
            type="checkbox"
            onChange={handleChange}
            //defaultChecked={defaultChecked}
            disabled={!chkbox == true}
            // disabled={row.original.pickup_status != null}
            onChange={() => handleOnChange(row.original.id,row.original.ConnoteNo)}
            selected={selectedid.includes(row.original.id,row.original.ConnoteNo)}
          />
        );
      };

    const SendCell = ({ row: { index, original } }) => {
        const onClick = () => {
          const newItems = Array.from(items);
          newItems.splice(index, 1);
          setItems(newItems);
        };
        return <button onClick={onClick}>Print</button>;
      };

      const SendCell2 = ({ row: { index, original } }) => {
        const onClick = () => {
          const newItems = Array.from(items);
          newItems.splice(index, 1);
          setItems(newItems);
        };
        return <button onClick={onClick}>Track</button>;
      };

      const handlesubmitdropoff = useCallback(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-User-Key", "QXhrS2NJVExVQWNtbmNsa0c5eWhzRXpTbXo0d0QwN2c=");
        var raw = {shopname:shopnew,orderid:selectedid}
        var data = JSON.stringify(raw);
        console.log("Dropoff Data data: ", data);
        var pickupoptions = {
        method: 'POST',
        headers: myHeaders,
        body: data,
        redirect: 'follow'
        };
        fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_dropoff/v1`, pickupoptions)
        .then(function(response) {
        return response.text();
        }).then(resdata => {
        var resjson = JSON.parse(resdata);
        var resjoncd = resjson.Dropoffresult;
        console.log("response dropoff request: ",resjoncd)
        if(resjoncd = "Ready to dropoff"){
          alert("selected item ready to dropoff")
          setSelectedid([]);
          window.location.reload(true);
        }else{
          alert("Error sending data to POS Malaysia. please contact POS malaysia!")
        }
        })
        .catch((error) => {
        console.error("Error pickup request : " + error);
          });

        //const updateorder = gql{};

      }); 
      function checkselectcheckbox () {

        console.log(selectedid.length)
        let t = selectedid.length;
        if (t < 1) {
        console.log("minimum is 1 item for pickup") 
        //alert("minimum item for pickup is 5")
        setActiveerror(true);
       } else if (t >= 1) {
       console.log("ok") 
            setActivepickup(true);
       }  
       
       console.log("selectedid " + selectedid)
       console.log("selectedcon " + selectedcon)
      }

    //#endregion
   
  //#region list of const
      const [acctno, setacctno] = React.useState([]);
      const [value, setValue] = React.useState("");
      const [connoteno, setconnoteno] = useState("");
      const [activetrack, setActivetrack] = useState(false);
      const [activeerror, setActiveerror] = useState(false);
      const [activepickup, setActivepickup] = useState(false);
      const handleChangetrack = useCallback(() => setActivetrack(!activetrack), [activetrack]);  
      const handleChangeerror = useCallback(() => setActiveerror(!activeerror), [activeerror]);  
      const handleChangepickup = useCallback(() => setActivepickup(!activepickup), [activepickup]); 
   
      const [selectedcon, setSelectedcon] = useState([]);
      const handleOnChange = useCallback((id,ConnoteNo) => {
        let selected = selectedid;
        let selected2 = selectedcon;
        let find = selectedid.indexOf(id);
        let find2 = selectedcon.indexOf(ConnoteNo);
        
        if(find > -1 && find2 > -1){
          selected.splice(find, 1);
          selected2.splice(find2, 1);
        } else {
          selected.push(id);
          selected2.push(ConnoteNo);
        }  
       
        setSelectedid(selected);   
        setSelectedcon(selected2);  
       
      });
      console.log("selectedcon: ",selectedcon);  
//#endregion

  const columns = React.useMemo(
    () => [
      {
        Header: shopdet.shop.name,
        columns: [
            {
                Header: ' ',
                Cell: CheckboxCell,
                accessor: 'reqPickup',
                
              },
          {
            Header: 'Order ID',
            accessor: 'name',
          },
          
          {
            Header: 'Tracking No',
            accessor: 'ConnoteNo',
          },
     
          {
            Header: 'Customer Name',
            accessor: 'FirstName',
          },
          {
            Header: 'Customer Email',
            accessor: 'contact_email',
          },
          {
            Header: 'Date',
            accessor: 'created_at',
          },
          {
            Header: 'Status',
            accessor: 'status',
          }, {
            Header: 'Status Date',
            accessor: 'status_date',
          },
          // {
          //   Header: "",
          //   Cell: SendCell,
          //   accessor: "printLabel"
          // },{
          //   Header: "",
          //   Cell: SendCell2,
          //   accessor: "Tracking"
          // }
          // ,

          { 
            Header: "Actions",
            //accessor: 'test',


            Cell: ({row}) => {
            //const rowShopDomain = row.shopnames;
            //console.log("text kjsdksjdksdj");
            //console.log("row.original.id=> "+ row.original.id);
            //console.log("row.original.shopify_shop_domain=> "+ row.original.shopify_shop_domain);
            console.log("row.original.connoteno=> "+ row.original.ConnoteNo);
            console.log("row.original.checkstat=> "+ row.original.checkstat);

            //orders.map(shopif)
             //props.row.name;
             //const rowId = props.row;
             //const rowConnote = orders.map(({shopify_shop_domain,index}) => <li key={index}>{shopify_shop_domain}</li>);
             
            // console.log( rowShopDomain +  " and " + rowId + " cnt :" )

          
            return (
              <div>
                 {
                  <button onClick={() => getData(row.original.shopify_shop_domain,row.original.id)}><i></i>< img width="20px" src ="https://freeiconshop.com/wp-content/uploads/edd/print-outline.png"/></button>
                  }
                    <span> </span> 
                    <span> </span> 
                  {
                  <button onClick={() => {
                    setconnoteno(row.original.ConnoteNo);
                    setActivetrack(true);} } ><i></i><img width="20px"  src="https://freeiconshop.com/wp-content/uploads/edd/document-search-flat.png"/></button>
                  }
                  
              </div>
            );
          },
        },
                  
        ],
      },
    ],
    []
  )

function getOrderlist(shopnames){
    React.useEffect(() => {    const url = 
      `https://apis.pos.com.my/apigateway/as01/api/shopify_orderwithcustomer/v1?shopdomain=${shopnames}`     
           fetch(url, {  
           method: "GET", 
           headers: {
             "X-User-Key": "SWJ3WkVlVEt6TkxiUkU5T3FTU2N5V3RGZnRKY3BYNTc=",
           },

           })
           .then(data => {
               return data.json();
           })
           .then(data => {
               console.log("orders data :" + JSON.stringify(data.result));
               setacctno(data.result[0].acctno);
               console.log(url)
               let datas = data.result;
               let Ldata = datas.length;
              setOrders(data.result);
           })
           .catch(err => {
               console.log('data is empty');
           });
       }, []);
  }
/// get label
function getData(shopnames,orderid){
//alert(shopnames);
  
  const url = `https://apis.pos.com.my/apigateway/as01/api/shopify_preacceptancev2/v1?shopname=${shopnames}&orderid=${orderid}`
        fetch(url, {  
          method: "GET", 
          headers: {
            "X-User-Key": "OUVjMXdBY2psdlExV2R3cHp3aVFVNmEyZWlqTDRXeWc=",
          },
          })
          .then(data => {
            return data.json();
          })
          .then(data => {
            var jsondata = data;
            var status = jsondata.ress.status;
            if(status == "OK"){
              var datapdf = jsondata.ress.pdf;
              setbase64(datapdf);
              setActive(true);
            }else{
              var err = jsondata.ress.errors; 
              alert('Error Label request: ' + JSON.stringify(err));
            }
        })
          .catch(err => {
              console.log('No Data Requested', err);
              alert('Error : ' + <b/> + 'jsondata.ress.pdf')
          });
  }
  //const [value, setValue] = React.useState("");
  
        return (
          <>   
              <Styles>
                <br/>
                <Table 
                columns={columns} 
                data={orders} />
              
                  <p align='center'>{`Showing ${orders.length} of ${orders.length} results`}</p>
              <br/>
                <div className="col-md-8">
                  <button className="btn button3" onClick={() => {
                  //setActivepickup(true);} } 
                  checkselectcheckbox()} } >
                    Pickup Request
                  </button>
                 <span> </span>
                  <button className="btn button3" onClick={handlesubmitdropoff}>
                    DropOff Request
                  </button>
                 
                  <div style={{center: '300px'}}>
          
                    <Modal
                          large = "100px"
                          open={active}
                          onClose={handleChangemodal}
                          title="Poslaju Label"
                          primaryAction={{
                            content: 'Close',
                            onAction: handleChangemodal,
                          }}
                        >
                    <iframe src={labeltorpint} 
                      width="800px"
                      height="700px"
                    />
                    </Modal>
                    
                    <Modal
                          large = "100px"
                          open={activetrack}
                          onClose={handleChangetrack}
                          title="Tracking Item"
                          primaryAction={{
                            content: 'Close',
                            onAction: handleChangetrack,
                          }}
                        >
                        <Modal.Section>
                          <Page>
                          <Tracking connoteno={connoteno} />
                          </Page>
                        </Modal.Section>
                    </Modal>
          
                    <Modal
                          large = "Max"
                          open={activepickup}
                          onClose={handleChangepickup}
                          title="Create Pickup"
                          //className="special_modal"
                          //style={{background: 'red'}}
                          primaryAction={{
                            content: 'Close',
                            onAction: handleChangepickup,
                          }}
                        >
                        <Modal.Section>
                          <Page>
                          <Pickup shopname={[shopnew,selectedid,shopdetail,selectedcon,acctno]} />
                          </Page>
                        </Modal.Section>
                    </Modal>    
                    
                    <Modal
                        //large = "Max"
                        open={activeerror}
                        onClose={handleChangeerror}
                        title="Alert!"
                        primaryAction={{
                          content: 'Close',
                          onAction: handleChangeerror,
                        }}
                      >
                      
                      <Modal.Section>
                        <Page>
                        <div><strong>Select at least 1 item for pickup</strong></div>
                        </Page>
                      </Modal.Section>
                  </Modal>  
          
                  </div>  
                </div>
              </Styles>
             
          </> 
             )
     
  
}



// export default App
