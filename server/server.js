import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import {NexApiRequest,NextApiResponse} from "next";
import Router from "koa-router";
import RedisStore from './redis-store';
import amqp from "amqplib";


const express = require('express');
var bodyParser = require('body-parser');
const { json, query } = require('express');
const mssql = require('mssql');

const sqlConfig = {
  user: 'sa',
  password: 'gksb123$',
  database: 'ShopifyStaging',
  server: '10.1.16.92',
  pool: {
    max: 10,
    min: 0,
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const shopify_pool = new mssql.ConnectionPool(sqlConfig);
const shopifypoolConnect = shopify_pool.connect();

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8120;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

// Create a new instance of the custom storage class
const sessionStorage = new RedisStore();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.January21,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  //SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionStorage.storeCallback,
    sessionStorage.loadCallback,
    sessionStorage.deleteCallback,
  ),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};


const mqserver = "10.1.16.44";
const mqusername = "mqadmin";
const mqpassword = "t3rM|n4t0R";
const queueName = 'shopifyorder';
const shopque = 'shopifyshopdetail';
const preacceptanceshopifyque = 'shopifypreacceptance';
const preacceptanceshopifyqueretry = 'shopifypreacceptanceretry';
const mqport = "5672";

app.prepare().then(async () => {
  
  
  const conn = await amqp.connect("amqp://" + mqusername + ":" + mqpassword + "@" + mqserver + ":" + mqport + "?heartbeat=60");
  const channel = await conn.createChannel();
  const q = channel.assertExchange(queueName, 'fanout', { durable: true, arguments: { "x-queue-type": "classic" } });
  const qs = channel.assertExchange(shopque, 'fanout', { durable: true, arguments: { "x-queue-type": "classic" } });
  const Preshopq = channel.assertExchange(preacceptanceshopifyque, 'fanout', { durable: true, arguments: { "x-queue-type": "classic" } });
  const Preshopqrtry = channel.assertExchange(preacceptanceshopifyqueretry, 'fanout', { durable: true, arguments: { "x-queue-type": "classic" } });

      
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
    
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const RegAppUninstalledWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/app/uninstalled",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>{
            console.log("uninstall  apps!");
            //const conn_v1 = await amqp.connect("amqp://" + mqusername + ":" + mqpassword + "@" + mqserver + ":" + mqport + "?heartbeat=60");
            //const channel_v1 = await conn_v1.createChannel();
            channel.assertQueue('q.uninstall_apps', { durable: true});
            let myobj = {};
            myobj.shop = shop;
            console.log(JSON.stringify(myobj));          
            channel.sendToQueue('q.uninstall_apps',new Buffer.from(JSON.stringify(myobj)),{persistent:true});
            //conn_v1.close();
            
            delete ACTIVE_SHOPIFY_SHOPS[shop];
            },
        });

        if (!RegAppUninstalledWebhook.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }        
        //Register ORDERS_CREATE Webhook 
        const RegOrderCreatedWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/created",
          topic: "ORDERS_CREATE",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/create";
                obj.shopifyorderid = obj.id;
                console.log("inserting data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });
        

        if (!RegOrderCreatedWebhook.success) {
          console.log(
            `Failed to register ORDERS_CREATE webhook: ${RegOrderCreatedWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_CREATE Webhook Successfully Created : ${RegOrderCreatedWebhook.result}`
          );
        }    
        
        //Register ORDERS_UPDATE Webhook
        const RegOrderUpdatedWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "ORDERS_UPDATED",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/updated";
                obj.shopifyorderid = obj.id;
                console.log("inserting updated data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!RegOrderUpdatedWebhook.success) {
          console.log(
            `Failed to register ORDERS_UPDATED webhook: ${RegOrderUpdatedWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_UPDATED Webhook Successfully Created : ${RegOrderUpdatedWebhook.result}`
          );
        }


        //Register SHOP_UPDATE Webhook
        const ShopUpdateWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "SHOP_UPDATE",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shop = shop;
                obj.topic = "shop/update";
                //obj.shopifyorderid = obj.id;
                console.log("inserting updated data to shop details queue!");
                console.log(obj);

                try{
                    channel.publish("shopifyshopdetail", 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!ShopUpdateWebhook.success) {
          console.log(
            `Failed to register SHOP_UPDATE webhook: ${ShopUpdateWebhook.result}`
          );
        }else{
          console.log(
            `SHOP_UPDATE Webhook Successfully Created : ${ShopUpdateWebhook.result}`
          );
        }



        //Register ORDERS_DELETE Webhook
        const RegOrderDeletedWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "ORDERS_DELETE",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/delete";
                obj.shopifyorderid = obj.id;
                console.log("inserting deleted data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!RegOrderDeletedWebhook.success) {
          console.log(
            `Failed to register ORDERS_DELETE webhook: ${RegOrderDeletedWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_DELETE Webhook Successfully Created : ${RegOrderDeletedWebhook.result}`
          );
        }
        
        
        //Register ORDERS_FULFILLED Webhook
        const RegOrderFullfilledWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "ORDERS_FULFILLED",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/fulfilled";
                obj.shopifyorderid = obj.id;
                console.log("inserting fulfilled data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!RegOrderFullfilledWebhook.success) {
          console.log(
            `Failed to register ORDERS_FULFILLED webhook: ${RegOrderFullfilledWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_FULFILLED Webhook Successfully Created : ${RegOrderFullfilledWebhook.result}`
          );
        }
        
        
        //Register ORDERS_CANCELLED Webhook
        const RegOrdersCancelledWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "ORDERS_CANCELLED",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/cancelled";
                obj.shopifyorderid = obj.id;
                console.log("inserting cancelled data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!RegOrdersCancelledWebhook.success) {
          console.log(
            `Failed to register ORDERS_CANCELLED webhook: ${RegOrdersCancelledWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_CANCELLED Webhook Successfully Created : ${RegOrdersCancelledWebhook.result}`
          );
        }
        
        
        //Register ORDERS_PAID Webhook
        const RegOrdersPaidWebhook = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks/orders/updated",
          topic: "ORDERS_PAID",
          apiVersion : ApiVersion.January21,
          webhookHandler: async (topic, shop, body) =>{
                console.log("nama kedai");
                console.log(shop);
                console.log(body);
                
                //var objheader = JSON.parse(JSON.stringify(req.headers));
                //var shopdomain = objheader['x-shopify-shop-domain'];
                //var topic = objheader['x-shopify-topic'];
                //var shopifyorderid = objheader['x-shopify-order-id'];
                
                let obj = JSON.parse(body);
                obj.shopdomain = shop;
                obj.topic = "orders/paid";
                obj.shopifyorderid = obj.id;
                console.log("inserting order paid data to order queue!");
                console.log(obj);

                try{
                    channel.publish(queueName, 'fanout', Buffer.from(JSON.stringify(obj)));
                    console.log("send to que");
                    //res.status(200).json( 
                    //    "message receive"
                    //); 
                    
                }catch (e){
                    //res.status(400).json( 
                    //    "Error : " + e
                    //);    
                    console.log("Error : " + e)
                } 
            //console.log(headers);           
            },
        });

        if (!RegOrdersPaidWebhook.success) {
          console.log(
            `Failed to register ORDERS_PAID webhook: ${RegOrdersPaidWebhook.result}`
          );
        }else{
          console.log(
            `ORDERS_PAID Webhook Successfully Created : ${RegOrdersPaidWebhook.result}`
          );
        }

        //GDPR customer_request
      //  const GDPRCustomerdatarequest = await Shopify.Webhooks.Registry.register({
      //     shop,
      //     accessToken,
      //     path: "/customer/data_request",
      //     topic: "customer_request",
      //     apiVersion : ApiVersion.January21,
      //     webhookHandler: async (topic, shop, body) =>{
      //           console.log("shop", shop,body)
      //       },
      //   });

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );
  
  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks/app/uninstalled", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Unninstalled Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });


  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });


  router.post("/webhooks/orders/created", async (ctx) => {
     try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
    //console.log(ctx.req.headers);
    //console.log(ctx.req.body);    
  });

  router.post("/webhooks/orders/updated", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log('Webhook Orders Updated received, returned status code 200 ', ctx.state.webhook);
      
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
     // await sleep(3000);
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("/customer/data_request",async (req,res)=> {
    var obj = JSON.parse(JSON.stringify(req.body));
    if((obj.hasOwnProperty('shop_domain') == true) && (obj.hasOwnProperty('customer') == true) && (obj.customer.hasOwnProperty('id') == true)){
      var shopdomain = obj.shop_domain;
      var custID = obj.customer.id;
      console.log("obj: ", obj);
      console.log("shopdomain: ", shopdomain);
      console.log("custID: ", custID);
      //var topic = objheader['x-shopify-topic'];
      //var shopifyorderid = objheader['x-shopify-order-id'];
      try{
          await shopifypoolConnect;
          let query = await shopify_pool.request()
          .input('shopify_shop_domain',mssql.VarChar(100),shopdomain)
          .input('CustID',mssql.VarChar(100),custID)
          .execute('sp_GetDataRequest', function(err, returnValue){
              if(err){
                  res.status(404).json({
                  });
                  console.log(err);
              }else{
                  var result = returnValue.recordsets[0];
                  console.log("result: ", returnValue);
                  res.status(200).json({
                      result
                    });
              }
          })
            }catch (e){
              console.log("customer data_request Error: ",e);
          }
      } else {
          res.status(412).json({
              "Error":"shop_domain,customer.id is required"
          });
      }
  });
  
  router.get("/api",handleRequest, async (req,res)=> {
      console.log('hello');
      res.send(200).json({
              "Hello api":"shop_domain,customer.id is required"
          });
       
    });

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
