// ==UserScript==
// @name         Qwiklabs Completed Labs Tracker
// @name:ja      Qwiklabsラボ完成トラッカー
// @namespace    https://chriskyfung.github.io/
// @version      2.1.1
// @author       chriskyfung
// @description  Label completed quests and labs on the Catalog page(s) and Lab pages on Google Cloud Skills Boost (https://www.cloudskillsboost.google/catalog)
// @homepage     https://chriskyfung.github.io/blog/qwiklabs/Userscript-for-Labelling-Completed-Qwiklabs
// @icon         https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-32x32.png
// @icon64       https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-64x64.png
// @updateURL    https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/raw/master/qwiklabs-explorer.user.js
// @supportUrl   https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues
// @match        https://*.cloudskillsboost.google/
// @match        https://*.cloudskillsboost.google/catalog*
// @match        https://*.cloudskillsboost.google/course_templates/*
// @match        https://*.cloudskillsboost.google/focuses/*
// @match        https://*.cloudskillsboost.google/quests/*
// @match        https://*.cloudskillsboost.google/profile/activity*
// @require      https://unpkg.com/dexie@latest/dist/dexie.js
// ==/UserScript==

(function() {
  'use strict';

  const isDebugMode = false;
  const CLOUD_SKILLS_BOOST_BASE_URL = 'https://www.cloudskillsboost.google';

  const dbName = 'qwiklabs-db-test-1';
  const qdb = new Dexie(dbName);

  let tmpdb = {'labs': null, 'quests': null};

  /**
   * Initialize Database if not yet exist
   */
  async function initDB() {
    console.debug('initDB - start');
    //
    // Define database
    //
    qdb.version(1).stores({
      labs: '&id,name,status',
      quests: '&id,name,status',
    });
    console.debug('Using Dexie v' + Dexie.semVer);

    const qldata = {
      'labs': [
        {'id': 279, 'name': 'Introduction to Amazon Virtual Private Cloud (VPC)', 'status': ''},
        {'id': 292, 'name': 'Building a Media Sharing Website - Part 1:Media Upload', 'status': ''},
        {'id': 390, 'name': 'Introduction to Elastic Load Balancing', 'status': ''},
        {'id': 401, 'name': 'Using Tableau Desktop with Amazon Redshift', 'status': ''},
        {'id': 551, 'name': 'Cloud IAM:Qwik Start', 'status': ''},
        {'id': 552, 'name': 'Continuous Delivery Pipelines with Spinnaker and Kubernetes Engine', 'status': ''},
        {'id': 557, 'name': 'Orchestrating the Cloud with Kubernetes', 'status': ''},
        {'id': 558, 'name': 'Set Up Network and HTTP Load Balancers', 'status': ''},
        {'id': 560, 'name': 'Compute Engine:Qwik Start - Windows', 'status': ''},
        {'id': 563, 'name': 'Getting Started with Cloud Shell & gcloud', 'status': ''},
        {'id': 564, 'name': 'Hello Node Kubernetes', 'status': ''},
        {'id': 565, 'name': 'Provision Services with GCP Marketplace', 'status': ''},
        {'id': 569, 'name': 'Cloud Storage:Qwik Start - CLI/SDK', 'status': ''},
        {'id': 577, 'name': 'BigQuery:Qwik Start - Command Line', 'status': ''},
        {'id': 579, 'name': 'Bigtable:Qwik Start - Command Line', 'status': ''},
        {'id': 580, 'name': 'Bigtable:Qwik Start - Hbase Shell', 'status': ''},
        {'id': 581, 'name': 'AI Platform:Qwik Start', 'status': ''},
        {'id': 582, 'name': 'Cloud Natural Language API:Qwik Start', 'status': ''},
        {'id': 584, 'name': 'Dataprep:Qwik Start', 'status': ''},
        {'id': 585, 'name': 'Dataproc:Qwik Start - Command Line', 'status': ''},
        {'id': 586, 'name': 'Dataproc:Qwik Start - Console', 'status': ''},
        {'id': 588, 'name': 'Google Cloud Speech API:Qwik Start', 'status': ''},
        {'id': 589, 'name': 'Google Genomics:Qwik Start', 'status': ''},
        {'id': 599, 'name': 'Data Loss Prevention:Qwik Start - Command Line', 'status': ''},
        {'id': 600, 'name': 'Data Loss Prevention:Qwik Start - JSON', 'status': ''},
        {'id': 603, 'name': 'Video Intelligence:Qwik Start', 'status': ''},
        {'id': 604, 'name': 'Analyzing Natality Data Using AI Platform and BigQuery', 'status': ''},
        {'id': 605, 'name': 'Building an IoT Analytics Pipeline on Google Cloud Platform', 'status': ''},
        {'id': 607, 'name': 'Predict Baby Weight with TensorFlow on AI Platform', 'status': ''},
        {'id': 608, 'name': 'Run a Big Data Text Processing Pipeline in Cloud Dataflow', 'status': ''},
        {'id': 609, 'name': 'Weather Data in BigQuery', 'status': ''},
        {'id': 610, 'name': 'Working with Google Cloud Dataprep', 'status': ''},
        {'id': 611, 'name': 'Autoscaling an Instance Group with Custom Cloud Monitoring Metrics', 'status': ''},
        {'id': 612, 'name': 'Building High Availability and High Bandwidth NAT Gateways', 'status': ''},
        {'id': 615, 'name': 'Deploying Memcached on Kubernetes Engine', 'status': ''},
        {'id': 616, 'name': 'Hello Istio with Kubernetes Engine', 'status': ''},
        {'id': 617, 'name': 'Running Dedicated Game Servers in Google Kubernetes Engine', 'status': ''},
        {'id': 619, 'name': 'Creating and Alerting on Logs-based Metrics', 'status': ''},
        {'id': 621, 'name': 'Monitoring Multiple Projects with Cloud Monitoring', 'status': ''},
        {'id': 624, 'name': 'Exploring NCAA Data with BigQuery', 'status': ''},
        {'id': 629, 'name': 'Using OpenTSDB to Monitor Time-Series Data on Cloud Platform', 'status': ''},
        {'id': 634, 'name': 'Implementing an AI Chatbot with Dialogflow', 'status': ''},
        {'id': 639, 'name': 'Managing Deployments Using Kubernetes Engine', 'status': ''},
        {'id': 640, 'name': 'Running a MongoDB Database in Kubernetes with StatefulSets', 'status': ''},
        {'id': 641, 'name': 'Building a High-throughput VPN', 'status': ''},
        {'id': 642, 'name': 'Creating Cross-region Load Balancing', 'status': ''},
        {'id': 647, 'name': 'Create a Cloud SQL Instance Using Deployment Manager', 'status': ''},
        {'id': 659, 'name': 'Firebase SDK for Cloud Functions', 'status': ''},
        {'id': 660, 'name': 'Firebase Web', 'status': ''},
        {'id': 662, 'name': 'Configuring and Deploying Windows SQL Server on GCP', 'status': ''},
        {'id': 663, 'name': 'Deploy ASP.NET Core App to Kubernetes Engine', 'status': ''},
        {'id': 666, 'name': 'Install and Use Cloud Tools for PowerShell', 'status': ''},
        {'id': 672, 'name': 'Introduction to Cloud Dataproc:Hadoop and Spark on Google Cloud Platform', 'status': ''},
        {'id': 673, 'name': 'Mapping the NYC Subway', 'status': ''},
        {'id': 674, 'name': 'Running a Spark Application with OpenCV on Cloud Dataproc', 'status': ''},
        {'id': 676, 'name': 'Speaking with a Webpage - Streaming Speech Transcripts', 'status': ''},
        {'id': 680, 'name': 'Using the Natural Language API from Google Docs', 'status': ''},
        {'id': 681, 'name': 'Using the Natural Language API with Ruby', 'status': ''},
        {'id': 690, 'name': 'Customize Network Topology with Subnetworks', 'status': ''},
        {'id': 697, 'name': 'Translate Text with the Cloud Translation API', 'status': ''},
        {'id': 698, 'name': 'Create a Basic Deployment Manager Template', 'status': ''},
        {'id': 699, 'name': 'HTTP Load Balancer', 'status': ''},
        {'id': 767, 'name': 'Cloud Endpoints:Qwik Start', 'status': ''},
        {'id': 798, 'name': 'Using Apigee for API Management', 'status': ''},
        {'id': 850, 'name': 'Introduction to git and GitHub', 'status': ''},
        {'id': 863, 'name': 'Deployment Manager:Qwik Start', 'status': ''},
        {'id': 867, 'name': 'Setting up a Private Kubernetes Cluster', 'status': ''},
        {'id': 870, 'name': 'Creating an Instance with Multiple Network Interfaces', 'status': ''},
        {'id': 872, 'name': 'NGINX Ingress Controller on Google Kubernetes Engine', 'status': ''},
        {'id': 878, 'name': 'Kubernetes Engine:Qwik Start', 'status': ''},
        {'id': 916, 'name': 'Cloud Functions:Qwik Start - Command Line', 'status': ''},
        {'id': 925, 'name': 'Google Cloud Pub/Sub:Qwik Start - Command Line', 'status': ''},
        {'id': 936, 'name': 'Cloud SQL for MySQL:Qwik Start', 'status': ''},
        {'id': 937, 'name': 'Cloud SQL for PostgreSQL:Qwik Start', 'status': ''},
        {'id': 941, 'name': 'Datastore:Qwik Start', 'status': ''},
        {'id': 951, 'name': 'App Engine:Qwik Start - Java', 'status': ''},
        {'id': 954, 'name': 'App Engine:Qwik Start - Ruby', 'status': ''},
        {'id': 964, 'name': 'VPC Network Peering', 'status': ''},
        {'id': 967, 'name': 'Distributed Load Testing Using Kubernetes', 'status': ''},
        {'id': 981, 'name': 'Deployment Manager - Full Production', 'status': ''},
        {'id': 986, 'name': 'Google Cloud SDK:Qwik Start - Redhat/Centos', 'status': ''},
        {'id': 999, 'name': 'Google Cloud Datalab:Qwik Start', 'status': ''},
        {'id': 1002, 'name': 'Cloud Source Repositories:Qwik Start', 'status': ''},
        {'id': 1005, 'name': 'Data Studio:Qwik Start', 'status': ''},
        {'id': 1014, 'name': 'App Engine:Qwik Start - Python', 'status': ''},
        {'id': 1029, 'name': 'Introduction to Docker', 'status': ''},
        {'id': 1035, 'name': 'IAM Custom Roles', 'status': ''},
        {'id': 1038, 'name': 'Service Accounts and Roles:Fundamentals', 'status': ''},
        {'id': 1044, 'name': 'Helm Package Manager', 'status': ''},
        {'id': 1050, 'name': 'Using Kubernetes Engine to Deploy Apps with Regional Persistent Disks', 'status': ''},
        {'id': 1059, 'name': 'App Dev-Adding User Authentication to your Application-Java', 'status': ''},
        {'id': 1060, 'name': 'App Dev - Deploying the Application into App Engine Flexible Environment - Java', 'status': ''},
        {'id': 1061, 'name': 'App Dev - Deploying the Application into Kubernetes Engine - Java', 'status': ''},
        {'id': 1062, 'name': 'App Dev:Setting up a Development Environment - Java', 'status': ''},
        {'id': 1063, 'name': 'App Dev - Storing Application Data in Cloud Datastore - Java', 'status': ''},
        {'id': 1071, 'name': 'App Dev:Adding User Authentication to your Application - Python', 'status': ''},
        {'id': 1073, 'name': 'App Dev:Deploying the Application into Kubernetes Engine - Python', 'status': ''},
        {'id': 1074, 'name': 'App Dev:Setting up a Development Environment - Python', 'status': ''},
        {'id': 1075, 'name': 'App Dev:Storing Image and Video Files in Cloud Storage - Python', 'status': ''},
        {'id': 1076, 'name': 'App Dev:Storing Application Data in Cloud Datastore - Python', 'status': ''},
        {'id': 1095, 'name': 'TensorFlow for Poets', 'status': ''},
        {'id': 1100, 'name': 'Dataflow:Qwik Start - Python', 'status': ''},
        {'id': 1101, 'name': 'Dataflow:Qwik Start - Templates', 'status': ''},
        {'id': 1104, 'name': 'Continuous Delivery with Jenkins in Kubernetes Engine', 'status': ''},
        {'id': 1107, 'name': 'App Dev:Developing a Backend Service - Python', 'status': ''},
        {'id': 1128, 'name': 'App Dev:Developing a Backend Service - Java', 'status': ''},
        {'id': 1141, 'name': 'App Dev-Storing Image and Video Files in Cloud Storage-Java', 'status': ''},
        {'id': 1145, 'name': 'BigQuery:Qwik Start - Console', 'status': ''},
        {'id': 1155, 'name': 'Ingesting Data Into The Cloud', 'status': ''},
        {'id': 1157, 'name': 'Loading Data into Google Cloud SQL', 'status': ''},
        {'id': 1158, 'name': 'Visualizing Data with Google Data Studio', 'status': ''},
        {'id': 1159, 'name': 'Processing Data with Google Cloud Dataflow', 'status': ''},
        {'id': 1160, 'name': 'Visualize Real Time Geospatial Data with Google Data Studio', 'status': ''},
        {'id': 1161, 'name': 'Loading Data into Google BigQuery for Exploratory Data Analysis', 'status': ''},
        {'id': 1162, 'name': 'Exploratory Data Analysis Using AI Platform', 'status': ''},
        {'id': 1163, 'name': 'Evaluating a Data Model', 'status': ''},
        {'id': 1204, 'name': 'Custom Providers with Terraform', 'status': ''},
        {'id': 1205, 'name': 'Deploy Kubernetes Load Balancer Service with Terraform', 'status': ''},
        {'id': 1206, 'name': 'HTTPS Content-Based Load Balancer with Terraform', 'status': ''},
        {'id': 1207, 'name': 'Modular Load Balancing with Terraform - Regional Load Balancer', 'status': ''},
        {'id': 1208, 'name': 'Terraform Fundamentals', 'status': ''},
        {'id': 1209, 'name': 'Using a NAT Gateway with Kubernetes Engine', 'status': ''},
        {'id': 1210, 'name': 'Using Vault on Compute Engine for Secret Management', 'status': ''},
        {'id': 1215, 'name': 'Cloud SQL with Terraform', 'status': ''},
        {'id': 1219, 'name': 'Deploy Refinery CMS to App Engine Flexible Environment', 'status': ''},
        {'id': 1229, 'name': 'VPC Networking Fundamentals', 'status': ''},
        {'id': 1230, 'name': 'Multiple VPC Networks', 'status': ''},
        {'id': 1231, 'name': 'VPC Networks - Controlling Access', 'status': ''},
        {'id': 1232, 'name': 'HTTP Load Balancer with Cloud Armor', 'status': ''},
        {'id': 1233, 'name': 'Dynamic VPN Gateways - Cloud Routers', 'status': ''},
        {'id': 1234, 'name': 'Network Tiers - Optimizing Network Spend', 'status': ''},
        {'id': 1235, 'name': 'Deployment Manager - Automating Network Deployment', 'status': ''},
        {'id': 1236, 'name': 'VPC Flow Logs - Analyzing Network Traffic', 'status': ''},
        {'id': 1241, 'name': 'Awwvision:Cloud Vision API from a Kubernetes Cluster', 'status': ''},
        {'id': 1249, 'name': 'Using VPC Network Peering', 'status': ''},
        {'id': 1250, 'name': 'Create an Internal Load Balancer', 'status': ''},
        {'id': 1251, 'name': 'Cloud CDN', 'status': ''},
        {'id': 1259, 'name': 'Reporting Application Metrics into Cloud Monitoring', 'status': ''},
        {'id': 1282, 'name': 'Network Performance Testing', 'status': ''},
        {'id': 1286, 'name': 'Improving Network Performance I', 'status': ''},
        {'id': 1287, 'name': 'Improving Network Performance II', 'status': ''},
        {'id': 1290, 'name': 'It Speaks! Create Synthetic Speech Using Cloud Text-to-Speech', 'status': ''},
        {'id': 1713, 'name': 'Getting Started with Cloud KMS', 'status': ''},
        {'id': 1715, 'name': 'Cloud Security Scanner:Qwik Start', 'status': ''},
        {'id': 1721, 'name': 'Cloud Profiler:Qwik Start', 'status': ''},
        {'id': 1724, 'name': 'G Suite Admin Getting Started - Personalization', 'status': ''},
        {'id': 1726, 'name': 'Integrating Machine Learning APIs', 'status': ''},
        {'id': 1734, 'name': 'Google Cloud Essential Skills:Challenge Lab', 'status': ''},
        {'id': 1735, 'name': 'Deploy a Compute Instance with a Remote Startup Script', 'status': ''},
        {'id': 1736, 'name': 'Configure a Firewall and a Startup Script with Deployment Manager', 'status': ''},
        {'id': 1737, 'name': 'Configure Secure RDP using a Windows Bastion Host', 'status': ''},
        {'id': 1738, 'name': 'Build and Deploy a Docker Image to a Kubernetes Cluster', 'status': ''},
        {'id': 1739, 'name': 'Scale Out and Update a Containerized Application on a Kubernetes Cluster', 'status': ''},
        {'id': 1740, 'name': 'Migrate a MySQL Database to Google Cloud SQL', 'status': ''},
        {'id': 1743, 'name': 'Networking 101', 'status': ''},
        {'id': 1749, 'name': 'Classify Text into Categories with the Natural Language API', 'status': ''},
        {'id': 1753, 'name': 'Creating a Persistent Disk', 'status': ''},
        {'id': 1758, 'name': 'Google Sheets as a Reporting Tool:Sheets API', 'status': ''},
        {'id': 1760, 'name': 'Cloud Storage:Qwik Start - Cloud Console', 'status': ''},
        {'id': 1763, 'name': 'Cloud Functions:Qwik Start - Console', 'status': ''},
        {'id': 1765, 'name': 'Kubernetes Monitoring', 'status': ''},
        {'id': 1768, 'name': 'Container Registry:Qwik Start', 'status': ''},
        {'id': 1771, 'name': 'Internet of Things:Qwik Start', 'status': ''},
        {'id': 1774, 'name': 'Cloud Spanner:Qwik Start', 'status': ''},
        {'id': 1776, 'name': 'Setting up Jenkins on Kubernetes Engine', 'status': ''},
        {'id': 1784, 'name': 'The Apps Script CLI - clasp', 'status': ''},
        {'id': 1789, 'name': 'Scikit-learn Model Serving with Online Prediction Using AI Platform', 'status': ''},
        {'id': 1791, 'name': 'Securing Your GKE Deployments with Binary Authorization', 'status': ''},
        {'id': 1794, 'name': 'Predict Visitor Purchases with a Classification Model in BQML', 'status': ''},
        {'id': 1797, 'name': 'Predict Taxi Fare with a BigQuery ML Forecasting Model', 'status': ''},
        {'id': 1800, 'name': 'A Tour of Cloud IoT Core', 'status': ''},
        {'id': 1802, 'name': 'Cloud Filestore:Qwik Start', 'status': ''},
        {'id': 1815, 'name': 'Cloud Spanner:Create a Gaming Leaderboard with C#', 'status': ''},
        {'id': 1817, 'name': 'Deploying a Fault-Tolerant Microsoft Active Directory Environment', 'status': ''},
        {'id': 1820, 'name': 'Creating Custom Interactive Dashboards with Bokeh and BigQuery', 'status': ''},
        {'id': 1823, 'name': 'Creating an Object Detection Application Using TensorFlow', 'status': ''},
        {'id': 1826, 'name': 'Running Distributed TensorFlow on Compute Engine', 'status': ''},
        {'id': 1831, 'name': 'Scanning User-generated Content Using the Cloud Video Intelligence and Cloud Vision APIs', 'status': ''},
        {'id': 1833, 'name': 'Monitoring and Logging for Cloud Functions', 'status': ''},
        {'id': 1836, 'name': 'Extract,Analyze,and Translate Text from Images with the Cloud ML APIs', 'status': ''},
        {'id': 1841, 'name': 'Detect Labels,Faces,and Landmarks in Images with the Cloud Vision API', 'status': ''},
        {'id': 1843, 'name': 'Entity and Sentiment Analysis with the Natural Language API', 'status': ''},
        {'id': 1846, 'name': 'Rent-a-VM to Process Earthquake Data', 'status': ''},
        {'id': 1852, 'name': 'Setting up a Minecraft Server on Google Compute Engine', 'status': ''},
        {'id': 1854, 'name': 'Using Ruby on Rails with Cloud SQL for PostgreSQL', 'status': ''},
        {'id': 1858, 'name': 'Google Maps Web Services Proxy for Mobile Applications', 'status': ''},
        {'id': 1860, 'name': 'Configuring Deployment Manager Templates', 'status': ''},
        {'id': 1863, 'name': 'Deployment Manager for Appserver', 'status': ''},
        {'id': 1910, 'name': 'Internal Load Balancer', 'status': ''},
        {'id': 2157, 'name': 'Getting Started with BQML', 'status': ''},
        {'id': 2163, 'name': 'Google Slides API as a Custom Presentation Tool', 'status': ''},
        {'id': 2165, 'name': 'Hangouts Chat bot - Apps Script', 'status': ''},
        {'id': 2167, 'name': 'App Maker - Build a Database Web App', 'status': ''},
        {'id': 2175, 'name': 'Using BigQuery with C#', 'status': ''},
        {'id': 2176, 'name': 'Using the Natural Language API with C#', 'status': ''},
        {'id': 2177, 'name': 'Using the Speech-to-Text API with C#', 'status': ''},
        {'id': 2178, 'name': 'Using the Text-to-Speech API with C#', 'status': ''},
        {'id': 2179, 'name': 'Using the Translation API with C#', 'status': ''},
        {'id': 2180, 'name': 'Using the Video Intelligence API with C#', 'status': ''},
        {'id': 2181, 'name': 'Using the Vision API with C#', 'status': ''},
        {'id': 2187, 'name': 'Speech to Text Transcription with the Cloud Speech API', 'status': ''},
        {'id': 2189, 'name': 'Querying Cloud Spanner With a Java Client', 'status': ''},
        {'id': 2196, 'name': 'Google Assistant:Qwik Start - Dialogflow', 'status': ''},
        {'id': 2197, 'name': 'Google Assistant:Qwik Start - Templates', 'status': ''},
        {'id': 2200, 'name': 'Write Apps That Access G Suite APIs', 'status': ''},
        {'id': 2205, 'name': 'Getting Started - App Maker', 'status': ''},
        {'id': 2456, 'name': 'Cloud Composer:Qwik Start - Console', 'status': ''},
        {'id': 2457, 'name': 'APIs Explorer:Qwik Start', 'status': ''},
        {'id': 2754, 'name': 'App Engine:Qwik Start - Go', 'status': ''},
        {'id': 2755, 'name': 'App Engine:Qwik Start - PHP', 'status': ''},
        {'id': 2764, 'name': 'Streaming IoT Core Data to Dataprep', 'status': ''},
        {'id': 2765, 'name': 'Streaming IoT Data to Google Cloud Storage', 'status': ''},
        {'id': 2766, 'name': 'Streaming IoT Kafka to Google Cloud Pub/Sub', 'status': ''},
        {'id': 2767, 'name': 'Using Firestore with Cloud IoT Core for Device Configuration', 'status': ''},
        {'id': 2768, 'name': 'Using Stackdriver Logging with IoT Core Devices', 'status': ''},
        {'id': 2771, 'name': 'Deploy a Web App on GKE with HTTPS Redirect using Lets Encrypt', 'status': ''},
        {'id': 2775, 'name': 'Google Cloud Pub/Sub:Qwik Start - Python', 'status': ''},
        {'id': 2789, 'name': 'Deploy a Ruby on Rails App to App Engine Flexible Environment', 'status': ''},
        {'id': 2792, 'name': 'Using Agones to Easily Create Scalable Game Servers', 'status': ''},
        {'id': 2794, 'name': 'A Tour of Qwiklabs and the Google Cloud Platform', 'status': ''},
        {'id': 2802, 'name': 'Introduction to SQL for BigQuery and Cloud SQL', 'status': ''},
        {'id': 3332, 'name': 'APIs Explorer:Create and Update a Cluster', 'status': ''},
        {'id': 3339, 'name': 'Deploying a Python Flask Web Application to App Engine Flexible', 'status': ''},
        {'id': 3340, 'name': 'Deploy Node.js Express Application in App Engine', 'status': ''},
        {'id': 3341, 'name': 'Build and Launch an ASP.NET Core App from Google Cloud Shell', 'status': ''},
        {'id': 3342, 'name': 'Deploy an ASP.NET Core App to App Engine', 'status': ''},
        {'id': 3347, 'name': 'Deploy Microsoft SQL Server to Compute Engine', 'status': ''},
        {'id': 3348, 'name': 'Running Windows Containers on Compute Engine', 'status': ''},
        {'id': 3349, 'name': 'Deploy Windows Server with ASP.NET Framework to Compute Engine', 'status': ''},
        {'id': 3389, 'name': 'Distributed Machine Learning with Google Cloud ML', 'status': ''},
        {'id': 3390, 'name': 'Machine Learning with Spark on Google Cloud Dataproc', 'status': ''},
        {'id': 3391, 'name': 'Machine Learning with TensorFlow', 'status': ''},
        {'id': 3392, 'name': 'Processing Time Windowed Data with Apache Beam and Cloud Dataflow (Java)', 'status': ''},
        {'id': 3393, 'name': 'Real Time Machine Learning with Google Cloud ML', 'status': ''},
        {'id': 3398, 'name': 'Provisioning and Using a Managed Hadoop/Spark Cluster with Cloud Dataproc (Command Line)', 'status': ''},
        {'id': 3414, 'name': 'Container-Optimized OS:Qwik Start', 'status': ''},
        {'id': 3460, 'name': 'ETL Processing on GCP Using Dataflow and BigQuery', 'status': ''},
        {'id': 3473, 'name': 'Introduction to APIs in Google', 'status': ''},
        {'id': 3481, 'name': 'APIs Explorer:PubSub and IoT', 'status': ''},
        {'id': 3483, 'name': 'Google Cloud Storage - Bucket Lock', 'status': ''},
        {'id': 3497, 'name': 'Query BigQuery with Python Using Ibis', 'status': ''},
        {'id': 3523, 'name': 'APIs Explorer:Compute Engine', 'status': ''},
        {'id': 3526, 'name': 'Google Assistant:Customizing Templates', 'status': ''},
        {'id': 3528, 'name': 'Cloud Composer:Copying BigQuery Tables Across Different Locations', 'status': ''},
        {'id': 3554, 'name': 'Building and Deploying Containers Using Amazon Elastic Container Service', 'status': ''},
        {'id': 3556, 'name': 'Cloud Scheduler:Qwik Start', 'status': ''},
        {'id': 3563, 'name': 'Creating a Virtual Machine', 'status': ''},
        {'id': 3565, 'name': 'Big Data Analysis to a Slide Presentation', 'status': ''},
        {'id': 3570, 'name': 'Video on Demand with AWS Elemental MediaConvert', 'status': ''},
        {'id': 3614, 'name': 'Explore and Create Reports with Data Studio', 'status': ''},
        {'id': 3616, 'name': 'Using BigQuery in the GCP Console', 'status': ''},
        {'id': 3618, 'name': 'Exploring Your Ecommerce Dataset with SQL in Google BigQuery', 'status': ''},
        {'id': 3632, 'name': 'APIs Explorer:Cloud Storage', 'status': ''},
        {'id': 3634, 'name': 'Google Assistant:Build an Application with Dialogflow and Cloud Functions', 'status': ''},
        {'id': 3638, 'name': 'Troubleshooting and Solving Data Join Pitfalls', 'status': ''},
        {'id': 3640, 'name': 'Creating a Data Warehouse Through Joins and Unions', 'status': ''},
        {'id': 3642, 'name': 'Troubleshooting Common SQL Errors with BigQuery', 'status': ''},
        {'id': 3644, 'name': 'Predict Housing Prices with Tensorflow and AI Platform', 'status': ''},
        {'id': 3662, 'name': 'APIs Explorer:App Engine', 'status': ''},
        {'id': 3676, 'name': 'Deployment Manager - Adding Load Balancing', 'status': ''},
        {'id': 3678, 'name': 'Create a Network Load-Balanced Logbook Application', 'status': ''},
        {'id': 3685, 'name': 'APIs Explorer:Cloud SQL', 'status': ''},
        {'id': 3688, 'name': 'Google Apps Script:Access Google Sheets,Maps & Gmail in 4 Lines of Code', 'status': ''},
        {'id': 3690, 'name': 'Creating Permanent Tables and Access-Controlled Views in BigQuery', 'status': ''},
        {'id': 3692, 'name': 'Ingesting New Datasets into BigQuery', 'status': ''},
        {'id': 3694, 'name': 'Creating Date-Partitioned Tables in BigQuery', 'status': ''},
        {'id': 3696, 'name': 'Working with JSON,Arrays,and Structs in BigQuery', 'status': ''},
        {'id': 3719, 'name': 'Google Cloud Pub/Sub:Qwik Start - Console', 'status': ''},
        {'id': 3744, 'name': 'Getting Started with Blockchain on GCP using Hyperledger Fabric and Composer', 'status': ''},
        {'id': 4047, 'name': 'Deployment Manager - Package and Deploy', 'status': ''},
        {'id': 4049, 'name': 'Creating a Gmail Add-on', 'status': ''},
        {'id': 4051, 'name': 'G Suite Certification:Practice Lab', 'status': ''},
        {'id': 4100, 'name': 'Asylo - an Open,Flexible Framework for Enclave Applications', 'status': ''},
        {'id': 4101, 'name': 'Running a gRPC Server Inside an Asylo Enclave', 'status': ''},
        {'id': 4102, 'name': 'Using Asylo to Protect Secret Data from an Attacker with Root Privileges', 'status': ''},
        {'id': 4167, 'name': 'Creating Custom Base Images for Compute Engine with Jenkins and Packer', 'status': ''},
        {'id': 4186, 'name': 'Site Reliability Troubleshooting with Cloud Monitoring APM', 'status': ''},
        {'id': 4188, 'name': 'Data Pipeline:Process Stream Data and Visualize Real Time Geospatial Data', 'status': ''},
        {'id': 4337, 'name': 'Bracketology with Google Machine Learning', 'status': ''},
        {'id': 4360, 'name': 'Deploy ASP.NET Core App to Google Kubernetes Engine with Istio', 'status': ''},
        {'id': 4362, 'name': 'Configuring Private Google Access and Cloud NAT', 'status': ''},
        {'id': 4375, 'name': 'Automating the Deployment of Networks with Terraform', 'status': ''},
        {'id': 4413, 'name': 'Creating a Chatbot for Hangouts Using Google Apps Script', 'status': ''},
        {'id': 4414, 'name': 'Implement a Helpdesk Chatbot with Dialogflow & BigQuery ML', 'status': ''},
        {'id': 4415, 'name': 'Creating a Data Transformation Pipeline with Cloud Dataprep', 'status': ''},
        {'id': 4784, 'name': 'Google Assistant:Build a Restaurant Locator with the Places API', 'status': ''},
        {'id': 4785, 'name': 'Google Assistant:Build a Youtube Entertainment App', 'status': ''},
        {'id': 4815, 'name': 'Introduction to GitLab on GKE', 'status': ''},
        {'id': 4817, 'name': 'Palo Alto Networks VM-Series Firewall:Automating Deployment with Terraform', 'status': ''},
        {'id': 4823, 'name': 'Build a Nearby Business Search Service with Google Maps Platform', 'status': ''},
        {'id': 5147, 'name': 'Cloud Run for Anthos', 'status': ''},
        {'id': 5154, 'name': 'Google Kubernetes Engine Security:Binary Authorization', 'status': ''},
        {'id': 5155, 'name': 'GKE Migrating to Containers', 'status': ''},
        {'id': 5156, 'name': 'Using Role-based Access Control in Kubernetes Engine', 'status': ''},
        {'id': 5157, 'name': 'Monitoring with Stackdriver on Kubernetes Engine', 'status': ''},
        {'id': 5158, 'name': 'Hardening Default GKE Cluster Configurations', 'status': ''},
        {'id': 5159, 'name': 'Tracing with Stackdriver on Kubernetes Engine', 'status': ''},
        {'id': 5162, 'name': 'Hello Cloud Run', 'status': ''},
        {'id': 5166, 'name': 'Empower Your Gmail Inbox with Google Cloud Functions', 'status': ''},
        {'id': 5171, 'name': 'HTTP Google Cloud Functions in Go', 'status': ''},
        {'id': 5538, 'name': 'How to Build a BI Dashboard Using Google Data Studio and BigQuery', 'status': ''},
        {'id': 5539, 'name': 'Logging with Stackdriver on Kubernetes Engine', 'status': ''},
        {'id': 5540, 'name': 'Kubernetes Engine Communication Through VPC Peering', 'status': ''},
        {'id': 5541, 'name': 'Securing Applications on Kubernetes Engine - Three Examples', 'status': ''},
        {'id': 5562, 'name': 'User Authentication:Identity-Aware Proxy', 'status': ''},
        {'id': 5568, 'name': 'Visualize the 10,000 Bitcoin Pizza Transaction Using BigQuery and AI Notebooks', 'status': ''},
        {'id': 5570, 'name': 'Tracking Cryptocurrency Exchange Trades with Google Cloud Platform in Real-Time', 'status': ''},
        {'id': 5572, 'name': 'How to Use a Network Policy on Google Kubernetes Engine', 'status': ''},
        {'id': 5576, 'name': 'Google Cloud IoT Core Commands', 'status': ''},
        {'id': 5625, 'name': 'Connect to Cloud SQL from an Application in Kubernetes Engine', 'status': ''},
        {'id': 5681, 'name': 'Creating a Serverless Video Conversion Watchfolder Workflow for MediaConvert', 'status': ''},
        {'id': 5682, 'name': 'Building a Live Video Channel with MediaLive,MediaStore and CloudFront', 'status': ''},
        {'id': 5683, 'name': 'Monetizing a Live Video Stream with AWS Elemental MediaTailor', 'status': ''},
        {'id': 5686, 'name': 'Deploy and Manage an Elastifile Cloud File System with Terraform', 'status': ''},
        {'id': 5825, 'name': 'Gmail:Getting Started', 'status': ''},
        {'id': 5826, 'name': 'Google Calendar:Getting Started', 'status': ''},
        {'id': 5827, 'name': 'Google Drive:Getting Started', 'status': ''},
        {'id': 5828, 'name': 'Google Sheets:Getting Started', 'status': ''},
        {'id': 5829, 'name': 'Shared Drives:Getting Started', 'status': ''},
        {'id': 5830, 'name': 'Google Sites:Getting Started', 'status': ''},
        {'id': 5831, 'name': 'Google Hangouts Meet:Getting Started', 'status': ''},
        {'id': 5834, 'name': 'Distributed Image Processing in Cloud Dataproc', 'status': ''},
        {'id': 5982, 'name': 'Running a Node.js Container on Google Kubernetes Engine', 'status': ''},
        {'id': 6034, 'name': 'Cloud Composer:Qwik Start - Command Line', 'status': ''},
        {'id': 6074, 'name': 'Fundamentals of Stackdriver Logging', 'status': ''},
        {'id': 6100, 'name': 'Using BigQuery and Cloud Logging to Analyze BigQuery Usage', 'status': ''},
        {'id': 6104, 'name': 'Ingesting FHIR Data with the Healthcare API', 'status': ''},
        {'id': 6129, 'name': 'Machine Learning Predictions with FHIR and Healthcare API', 'status': ''},
        {'id': 6132, 'name': 'Ingesting DICOM Data with the Healthcare API', 'status': ''},
        {'id': 6268, 'name': 'Understanding and Analyzing your Costs with Google Cloud Billing Reports', 'status': ''},
        {'id': 6270, 'name': 'VPC Networking:Cloud HA-VPN', 'status': ''},
        {'id': 6374, 'name': 'Using OAuth Authenticated SQLPad to Query SAP HANA Express', 'status': ''},
        {'id': 6376, 'name': 'Pipeline Graphs with Cloud Data Fusion', 'status': ''},
        {'id': 6430, 'name': 'Create a Custom Network Using Deployment Manager', 'status': ''},
        {'id': 6896, 'name': 'VM Migration:Assessment', 'status': ''},
        {'id': 6898, 'name': 'VM Migration:Modernize an Application Stack with GKE and MySQL', 'status': ''},
        {'id': 6899, 'name': 'VM Migration:Planning', 'status': ''},
        {'id': 6916, 'name': 'Examining BigQuery Billing Data in Google Sheets', 'status': ''},
        {'id': 6920, 'name': 'De-identifying DICOM Data with the Healthcare API', 'status': ''},
        {'id': 7015, 'name': 'Ingesting HL7v2 Data with the Healthcare API', 'status': ''},
        {'id': 7114, 'name': 'Analyzing Billing Data with BigQuery', 'status': ''},
        {'id': 7115, 'name': 'Visualizing Billing Data with Data Studio', 'status': ''},
        {'id': 7140, 'name': 'Configuring Networks via gcloud', 'status': ''},
        {'id': 7530, 'name': 'Using gsutil to Perform Operations on Buckets and Objects', 'status': ''},
        {'id': 7637, 'name': 'Building Redis with Asylo', 'status': ''},
        {'id': 7638, 'name': 'Building SQLite with Asylo', 'status': ''},
        {'id': 7639, 'name': 'Learning TensorFlow:the Hello World of Machine Learning', 'status': ''},
        {'id': 7678, 'name': 'Configuring IAM Permissions with gcloud', 'status': ''},
        {'id': 7685, 'name': 'Collecting and Analyzing Logs with Amazon CloudWatch Logs Insights', 'status': ''},
        {'id': 7797, 'name': 'Clean up Unused and Orphaned Persistent Disks', 'status': ''},
        {'id': 7830, 'name': 'Optimizing cost with Google Cloud Storage', 'status': ''},
        {'id': 7841, 'name': 'Clean up unused IP addresses', 'status': ''},
        {'id': 7842, 'name': 'Introduction to Amazon Elastic Container Registry', 'status': ''},
        {'id': 7847, 'name': 'Setting up Cost Control with Quota', 'status': ''},
        {'id': 7927, 'name': 'Amazon Elastic File System (EFS) Performance', 'status': ''},
        {'id': 7932, 'name': 'Introduction to Amazon EC2 Auto Scaling', 'status': ''},
        {'id': 7937, 'name': 'Creating Models with Amazon SageMaker', 'status': ''},
        {'id': 8367, 'name': 'Palo Alto Networks VM-Series Firewall:Securing the GKE Perimeter', 'status': ''},
        {'id': 8389, 'name': 'Build a Resilient,Asynchronous System with Cloud Run and Pub/Sub', 'status': ''},
        {'id': 8390, 'name': 'Build a Serverless App with Cloud Run that Creates PDF Files', 'status': ''},
        {'id': 8391, 'name': 'Build a Serverless Web App with Firebase', 'status': ''},
        {'id': 8392, 'name': 'Importing Data to a Firestore Database', 'status': ''},
        {'id': 8393, 'name': 'Share Data Securely via a REST API Using Cloud Run', 'status': ''},
        {'id': 8406, 'name': 'Classify Images of Clouds in the Cloud with AutoML Vision', 'status': ''},
        {'id': 8416, 'name': 'Programming AWS Security Token Service (STS) with .NET', 'status': ''},
        {'id': 8428, 'name': 'OpenTelemetry', 'status': ''},
        {'id': 8459, 'name': 'Installing Open Source Istio on Kubernetes Engine', 'status': ''},
        {'id': 8460, 'name': 'Installing the Istio on GKE Add-On with Kubernetes Engine', 'status': ''},
        {'id': 8461, 'name': 'Managing Policies and Security with Istio and Citadel', 'status': ''},
        {'id': 8462, 'name': 'Managing Traffic Routing with Istio and Envoy', 'status': ''},
        {'id': 8463, 'name': 'Observing Services using Prometheus,Grafana,Jaeger,and Kiali', 'status': ''},
        {'id': 8486, 'name': 'Exploring the Public Cryptocurrency Datasets Available in BigQuery', 'status': ''},
        {'id': 8496, 'name': 'Using IAM and Bucket Policies with Amazon S3', 'status': ''},
        {'id': 8498, 'name': 'Serverless Compute:Microservices with Cloud Functions', 'status': ''},
        {'id': 8500, 'name': 'Responding to Stackdriver Messages with Cloud Functions', 'status': ''},
        {'id': 8530, 'name': 'Live Video Workflow with Captions', 'status': ''},
        {'id': 8532, 'name': 'Image Insertion and Input Switching with AWS Elemental MediaLive', 'status': ''},
        {'id': 8533, 'name': 'AWS Tools for Windows PowerShell:Getting Started', 'status': ''},
        {'id': 8534, 'name': 'Programming AWS Lambda for Windows', 'status': ''},
        {'id': 8539, 'name': 'Working with Amazon Elastic Container Service', 'status': ''},
        {'id': 8556, 'name': 'Introduction to Amazon Elastic Container Service', 'status': ''},
        {'id': 8557, 'name': 'Introduction to Amazon Relational Database Service (RDS) (Windows)', 'status': ''},
        {'id': 8558, 'name': 'Use Google Maps API to Visualize BigQuery Geospatial Data', 'status': ''},
        {'id': 8567, 'name': 'Challenge Lab', 'status': ''},
        {'id': 8568, 'name': 'Media services:Use AWS AI services to automate captioning & subtitling', 'status': ''},
        {'id': 8578, 'name': 'Optimize slow databases with Amazon Aurora', 'status': ''},
        {'id': 8584, 'name': 'Working with AWS CodeCommit on Windows', 'status': ''},
        {'id': 8587, 'name': 'Game Hosting with Amazon GameLift', 'status': ''},
        {'id': 8612, 'name': 'IoT Edge Computing:AWS IoT Greengrass', 'status': ''},
        {'id': 8642, 'name': 'Creating an Amazon Virtual Private Cloud (VPC) with AWS CloudFormation', 'status': ''},
        {'id': 8661, 'name': 'Building Your First Amazon Virtual Private Cloud (VPC)', 'status': ''},
        {'id': 8706, 'name': 'Managing IoT Sensor Data with Amazon ElastiCache for Redis', 'status': ''},
        {'id': 8712, 'name': 'Working with Elastic Load Balancing', 'status': ''},
        {'id': 8715, 'name': 'Automating AWS Services with Scripting and the AWS CLI', 'status': ''},
        {'id': 10176, 'name': 'Introduction to Amazon API Gateway', 'status': ''},
        {'id': 10183, 'name': 'Centralized Log Processing with Amazon Elasticsearch Service', 'status': ''},
        {'id': 10210, 'name': 'Cloud Life Sciences:Variant Transforms Tool', 'status': ''},
        {'id': 10213, 'name': 'Serverless Web Apps using Amazon DynamoDB - Part 2', 'status': ''},
        {'id': 10227, 'name': 'Serverless Architectures using Amazon CloudWatch Events and Scheduled Events with AWS Lambda', 'status': ''},
        {'id': 10236, 'name': 'Deploy an End-to-End IoT Application', 'status': ''},
        {'id': 10237, 'name': 'Introduction to Amazon Elastic Block Store (EBS)', 'status': ''},
        {'id': 10244, 'name': 'Troubleshooting Cloud Service Mesh', 'status': ''},
        {'id': 10258, 'name': 'Google Cloud Essentials:Challenge Lab', 'status': ''},
        {'id': 10268, 'name': 'VM Migration:Qwik Start', 'status': ''},
        {'id': 10278, 'name': 'AWS Database Migration Service:Oracle to Aurora', 'status': ''},
        {'id': 10285, 'name': 'Reinforcement Learning:Qwik Start', 'status': ''},
        {'id': 10286, 'name': 'Launching and Managing a Web Application with AWS CloudFormation', 'status': ''},
        {'id': 10301, 'name': 'Working with AWS CodeCommit', 'status': ''},
        {'id': 10308, 'name': 'Caching Static Files with Amazon CloudFront', 'status': ''},
        {'id': 10371, 'name': 'Serverless Architectures with Amazon DynamoDB and Amazon Kinesis Streams with AWS Lambda', 'status': ''},
        {'id': 10377, 'name': 'Introduction to AWS Device Farm', 'status': ''},
        {'id': 10378, 'name': 'Streaming Dynamic Content using Amazon CloudFront', 'status': ''},
        {'id': 10379, 'name': 'Baseline Infrastructure:Challenge Lab', 'status': ''},
        {'id': 10383, 'name': 'Introduction to Amazon API Gateway', 'status': ''},
        {'id': 10385, 'name': 'Introduction to Amazon Relational Database Service (RDS) (Linux)', 'status': ''},
        {'id': 10386, 'name': 'Introduction to AWS CloudFormation Designer', 'status': ''},
        {'id': 10387, 'name': 'Introduction to AWS CloudFormation', 'status': ''},
        {'id': 10388, 'name': 'Introduction to AWS Key Management Service', 'status': ''},
        {'id': 10390, 'name': 'Deploy an Auto-Scaling HPC Cluster with Slurm', 'status': ''},
        {'id': 10403, 'name': 'Introduction to Amazon Kinesis Firehose', 'status': ''},
        {'id': 10404, 'name': 'Introduction to Amazon ElastiCache', 'status': ''},
        {'id': 10407, 'name': 'Introduction to Amazon DynamoDB', 'status': ''},
        {'id': 10408, 'name': 'Introduction to AWS Identity and Access Management (IAM)', 'status': ''},
        {'id': 10415, 'name': 'Using AWS Lambda with Amazon CloudWatch and SNS to Implement a Slack Chat Bot', 'status': ''},
        {'id': 10417, 'name': 'Cloud Architecture:Challenge Lab', 'status': ''},
        {'id': 10420, 'name': 'Using Amazon RDS for Applications', 'status': ''},
        {'id': 10432, 'name': 'Monitoring Security Groups with AWS Config', 'status': ''},
        {'id': 10433, 'name': 'Working with Alexa:Build a Trivia Skill', 'status': ''},
        {'id': 10436, 'name': 'Build a Dynamic Conversational Bot - Part 1', 'status': ''},
        {'id': 10437, 'name': 'Securing Google Cloud with CFT Scorecard', 'status': ''},
        {'id': 10439, 'name': 'Build a Dynamic Conversational Bot - Part 2', 'status': ''},
        {'id': 10443, 'name': 'Introduction to Amazon Relational Database Service (RDS) - SQL Server', 'status': ''},
        {'id': 10445, 'name': 'Deploy Your Website on Cloud Run', 'status': ''},
        {'id': 10448, 'name': 'Auditing Your Security with AWS Trusted Advisor', 'status': ''},
        {'id': 10450, 'name': 'Maintaining High Availability with Auto Scaling (for Linux)', 'status': ''},
        {'id': 10457, 'name': 'Kubernetes in Google Cloud:Challenge Lab', 'status': ''},
        {'id': 10467, 'name': 'Securing VPC Resources with Security Groups', 'status': ''},
        {'id': 10468, 'name': 'Programming Amazon S3 with .NET', 'status': ''},
        {'id': 10470, 'name': 'Deploy,Scale,and Update Your Website on Google Kubernetes Engine', 'status': ''},
        {'id': 10471, 'name': 'Working with Alexa:Build a Decision Tree Skill', 'status': ''},
        {'id': 10477, 'name': 'Working with Alexa:Build a Flashcard Skill', 'status': ''},
        {'id': 10478, 'name': 'Working with Alexa:Build a How-To Skill', 'status': ''},
        {'id': 10479, 'name': 'Automated Video Editing with YOU as the Star!', 'status': ''},
        {'id': 10486, 'name': 'Hosting WordPress Using Amazon S3', 'status': ''},
        {'id': 10487, 'name': 'Using Open Data with Amazon S3', 'status': ''},
        {'id': 10488, 'name': 'Introduction to Amazon Simple Storage Service (S3)', 'status': ''},
        {'id': 10490, 'name': 'S3:Multi-region Storage Backup with Cross-Region Replication', 'status': ''},
        {'id': 10491, 'name': 'Storage Gateway:File Gateway Network Configuration', 'status': ''},
        {'id': 10493, 'name': 'Build a Serverless Text-to-Speech Application with Amazon Polly', 'status': ''},
        {'id': 10496, 'name': 'Introduction to AWS CodeDeploy', 'status': ''},
        {'id': 10497, 'name': 'Hybrid Storage and Data Migration with AWS Storage Gateway File Gateway', 'status': ''},
        {'id': 10498, 'name': 'Building a Media Sharing Website - Part 1:Media Upload', 'status': ''},
        {'id': 10499, 'name': 'Migrating On-Premises NFS Using AWS DataSync and Amazon File Gateway', 'status': ''},
        {'id': 10501, 'name': 'Monitoring Security Groups with Amazon CloudWatch Events', 'status': ''},
        {'id': 10505, 'name': 'Spin Up A Blockchain Node with BlockApps STRATO in 3 minutes', 'status': ''},
        {'id': 10506, 'name': 'Working with Amazon Redshift', 'status': ''},
        {'id': 10512, 'name': 'Monitoring a Live Streaming Workflow with Amazon CloudWatch', 'status': ''},
        {'id': 10518, 'name': 'Introducing API Management on Top of a Legacy Platform', 'status': ''},
        {'id': 10519, 'name': 'Connect to Stackdriver Logging Using Apigee', 'status': ''},
        {'id': 10520, 'name': 'Establish a Data Lake from Cloud Logging to BigQuery with Apigee', 'status': ''},
        {'id': 10521, 'name': 'Leverage Apigee to Modernize Exposure & Secure Access', 'status': ''},
        {'id': 10522, 'name': 'Self Service API Discovery & Sign Up Experience', 'status': ''},
        {'id': 10523, 'name': 'Content Aggregation via Apigee - Bring in Google Hosted API Content', 'status': ''},
        {'id': 10524, 'name': 'Security Mediation with IAM Service Accounts and OAuth', 'status': ''},
        {'id': 10525, 'name': 'Conditional Routing of APIs Based on Feature Flag', 'status': ''},
        {'id': 10526, 'name': 'Controlling API Traffic Using the Istio Mixer Adapter for Apigee Edge', 'status': ''},
        {'id': 10527, 'name': 'Embedding Apigee into a CI/CD Lifecycle', 'status': ''},
        {'id': 10528, 'name': 'Enforcing API Management with Istio Service Mesh', 'status': ''},
        {'id': 10531, 'name': 'Use Go Code to Work with Google Cloud Data Sources', 'status': ''},
        {'id': 10532, 'name': 'Deploy Go Apps on Google Cloud Serverless Platforms', 'status': ''},
        {'id': 10537, 'name': 'Deploy DataStax Enterprise from the GCP Marketplace', 'status': ''},
        {'id': 10538, 'name': 'Deploying an Open Source Cassandra??Database using the GCP Marketplace', 'status': ''},
        {'id': 10539, 'name': 'Migrating an application and data from Apache Cassandra??to DataStax Enterprise', 'status': ''},
        {'id': 10541, 'name': 'Introduction to AWS Lambda', 'status': ''},
        {'id': 10594, 'name': '4 In A Row Game Development with Google Cloud + Unity', 'status': ''},
        {'id': 10599, 'name': 'Cloud Monitoring:Qwik Start', 'status': ''},
        {'id': 10601, 'name': 'Exploring Google Ngrams with Amazon EMR', 'status': ''},
        {'id': 10603, 'name': 'Cloud Engineering:Challenge Lab', 'status': ''},
        {'id': 10605, 'name': 'Compare Cloud AI Platform models using the What-If Tool to Identify Potential Bias', 'status': ''},
        {'id': 10769, 'name': 'Introduction to AWS OpsWorks', 'status': ''},
        {'id': 10778, 'name': 'Programming Amazon SQS and Amazon SNS with .NET', 'status': ''},
        {'id': 10779, 'name': 'Online Data Migration to Cloud Spanner using Striim', 'status': ''},
        {'id': 10876, 'name': 'Palo Alto Networks:VM-Series AutoScale in Google Cloud', 'status': ''},
        {'id': 10888, 'name': 'Prisma Cloud Compute: Securing GKE Run Time', 'status': ''},
        {'id': 10890, 'name': 'Build a Cloud Run application for SAP HANA', 'status': ''},
        {'id': 10895, 'name': 'Introduction to Amazon EC2', 'status': ''},
        {'id': 10899, 'name': 'Bayes Classification with Cloud Datalab,Spark,and Pig on Google Cloud Dataproc', 'status': ''},
        {'id': 10903, 'name': 'Identifying Bias in Mortgage Data using Cloud AI Platform and the What-if Tool', 'status': ''},
        {'id': 10904, 'name': 'Using the What-If Tool with Image Recognition Models', 'status': ''},
        {'id': 10906, 'name': 'Analyze Big Data with Hadoop', 'status': ''},
        {'id': 10908, 'name': 'Introduction to Amazon Elastic File System (EFS)', 'status': ''},
        {'id': 10910, 'name': 'Cloud Logging on Kubernetes Engine', 'status': ''},
        {'id': 10911, 'name': 'Fundamentals of Cloud Logging', 'status': ''},
        {'id': 10915, 'name': 'Applied Machine Learning:Building Models for an Amazon Use Case', 'status': ''},
        {'id': 10916, 'name': 'Serverless Web Apps using Amazon DynamoDB - Part 1', 'status': ''},
        {'id': 10917, 'name': 'Update Security Groups Automatically Using AWS Lambda', 'status': ''},
        {'id': 10919, 'name': 'Verily Pathfinder Virtual Agent for COVID-19 Chat App', 'status': ''},
        {'id': 10920, 'name': 'IoT Command and Control', 'status': ''},
        {'id': 10921, 'name': 'Building a Live Video Channel with MediaLive,MediaPackage and CloudFront', 'status': ''},
        {'id': 10927, 'name': 'Introduction to Amazon CloudFront', 'status': ''},
        {'id': 10928, 'name': 'Programming Amazon DynamoDB with .NET', 'status': ''},
        {'id': 10933, 'name': 'Ingesting Data Into The Cloud Using Google App Engine', 'status': ''},
        {'id': 10935, 'name': 'Introduction to Amazon Aurora', 'status': ''},
        {'id': 10936, 'name': 'Introduction to Amazon Simple Storage Service (S3)', 'status': ''},
        {'id': 10939, 'name': 'Automating DevOps Workflows with GitLab and Terraform', 'status': ''},
        {'id': 10940, 'name': 'Introduction to AWS CloudFormation Designer', 'status': ''},
        {'id': 10941, 'name': 'Applied Machine Learning:Building Models for an Amazon Use Case', 'status': ''},
        {'id': 10942, 'name': 'Update Security Groups Automatically Using AWS Lambda', 'status': ''},
        {'id': 10946, 'name': 'Palo Alto Networks:VM-Series Advanced Deployment', 'status': ''},
        {'id': 10948, 'name': 'Kubeflow Pipelines with AI Platform', 'status': ''},
        {'id': 10955, 'name': 'AWS Federated Authentication with AD FS', 'status': ''},
        {'id': 10957, 'name': 'Deploy an End-to-End IoT Application', 'status': ''},
        {'id': 10958, 'name': 'Troubleshooting Serverless Applications', 'status': ''},
        {'id': 10959, 'name': 'Building Serverless Applications with an Event-Driven Architecture', 'status': ''},
        {'id': 10960, 'name': 'Monitoring Security Groups with Amazon CloudWatch Events', 'status': ''},
        {'id': 10962, 'name': 'Managing IoT Sensor Data with Amazon ElastiCache for Redis', 'status': ''},
        {'id': 12007, 'name': 'Set Up Network and HTTP Load Balancers', 'status': ''},
      ],
      'quests': [
        {'id': 3, 'name': 'Websites & Web Apps', 'status': ''},
        {'id': 5, 'name': 'Big Data on AWS', 'status': ''},
        {'id': 6, 'name': 'Compute & Networking', 'status': ''},
        {'id': 7, 'name': 'Digital Media', 'status': ''},
        {'id': 8, 'name': 'Deployment & Management', 'status': ''},
        {'id': 9, 'name': 'Storage & CDN', 'status': ''},
        {'id': 10, 'name': 'Solutions Architect - Associate', 'status': ''},
        {'id': 11, 'name': 'Solutions Architect - Professional', 'status': ''},
        {'id': 12, 'name': 'Corporate Apps on AWS for Windows', 'status': ''},
        {'id': 13, 'name': 'Databases on AWS for Windows', 'status': ''},
        {'id': 14, 'name': 'SysAdmin on AWS for Windows', 'status': ''},
        {'id': 15, 'name': 'Programming Windows on AWS', 'status': ''},
        {'id': 16, 'name': 'SysOps Administrator - Associate', 'status': ''},
        {'id': 17, 'name': 'Serverless Design with AWS Lambda', 'status': ''},
        {'id': 18, 'name': 'Advanced Operations Using Amazon Redshift', 'status': ''},
        {'id': 19, 'name': 'Alexa Skills Development', 'status': ''},
        {'id': 21, 'name': 'Serverless Web Apps using Amazon DynamoDB', 'status': ''},
        {'id': 22, 'name': 'Security on AWS', 'status': ''},
        {'id': 23, 'name': 'Google Cloud Essentials', 'status': ''},
        {'id': 24, 'name': 'Cloud Architecture', 'status': ''},
        {'id': 25, 'name': 'Data Engineering', 'status': ''},
        {'id': 26, 'name': 'Deploying Applications', 'status': ''},
        {'id': 27, 'name': 'Windows on GCP', 'status': ''},
        {'id': 28, 'name': 'Scientific Data Processing', 'status': ''},
        {'id': 29, 'name': 'Kubernetes in Google Cloud', 'status': ''},
        {'id': 30, 'name': 'Deployment Manager', 'status': ''},
        {'id': 31, 'name': 'Networking in the Google Cloud', 'status': ''},
        {'id': 32, 'name': 'Machine Learning APIs', 'status': ''},
        {'id': 33, 'name': 'Baseline:Infrastructure', 'status': ''},
        {'id': 34, 'name': 'Baseline:Data,ML,AI', 'status': ''},
        {'id': 35, 'name': 'Google Cloud\'s Operations Suite', 'status': ''},
        {'id': 36, 'name': 'Google Cloud Solutions I:Scaling Your Infrastructure', 'status': ''},
        {'id': 37, 'name': 'Baseline:Deploy & Develop', 'status': ''},
        {'id': 38, 'name': 'Google Cloud Solutions II:Data and Machine Learning', 'status': ''},
        {'id': 39, 'name': 'Websites and Web Applications', 'status': ''},
        {'id': 40, 'name': 'Security & Identity Fundamentals', 'status': ''},
        {'id': 41, 'name': 'Application Development - Python', 'status': ''},
        {'id': 42, 'name': 'Application Development - Java', 'status': ''},
        {'id': 43, 'name': 'Data Science on Google Cloud', 'status': ''},
        {'id': 44, 'name': 'Managing Cloud Infrastructure with Terraform', 'status': ''},
        {'id': 45, 'name': 'Kubernetes Solutions', 'status': ''},
        {'id': 46, 'name': 'Network Performance and Optimization', 'status': ''},
        {'id': 47, 'name': 'Challenge:GCP Architecture', 'status': ''},
        {'id': 48, 'name': 'Developing Data and Machine Learning Apps with C#', 'status': ''},
        {'id': 49, 'name': 'IoT in the Google Cloud', 'status': ''},
        {'id': 50, 'name': 'Data Science on Google Cloud:Machine Learning', 'status': ''},
        {'id': 51, 'name': 'G Suite:Integrations', 'status': ''},
        {'id': 52, 'name': 'Cloud SQL', 'status': ''},
        {'id': 54, 'name': 'Exploring APIs', 'status': ''},
        {'id': 55, 'name': 'BigQuery For Data Analysis', 'status': ''},
        {'id': 57, 'name': 'App Modernization with Apigee', 'status': ''},
        {'id': 58, 'name': 'NCAA March Madness:Bracketology with Google Cloud', 'status': ''},
        {'id': 59, 'name': 'DevZone Quest', 'status': ''},
        {'id': 61, 'name': 'OK Google:Build Interactive Apps with Google Assistant', 'status': ''},
        {'id': 62, 'name': 'Public Cloud Security by Palo Alto Networks', 'status': ''},
        {'id': 63, 'name': 'Google Kubernetes Engine Best Practices', 'status': ''},
        {'id': 64, 'name': 'Google Kubernetes Engine Best Practices:Security', 'status': ''},
        {'id': 65, 'name': 'G Suite Essentials', 'status': ''},
        {'id': 66, 'name': 'Cloud Engineering', 'status': ''},
        {'id': 67, 'name': 'Cloud Development', 'status': ''},
        {'id': 68, 'name': 'BigQuery for Data Warehousing', 'status': ''},
        {'id': 69, 'name': 'BigQuery Basics for Data Analysts', 'status': ''},
        {'id': 70, 'name': 'BigQuery for Marketing Analysts', 'status': ''},
        {'id': 71, 'name': 'BigQuery for Machine Learning', 'status': ''},
        {'id': 81, 'name': 'Cloud Logging', 'status': ''},
        {'id': 82, 'name': 'Intro to ML:Language Processing', 'status': ''},
        {'id': 83, 'name': 'Intermediate ML:TensorFlow on GCP', 'status': ''},
        {'id': 84, 'name': 'Advanced ML:ML Infrastructure', 'status': ''},
        {'id': 85, 'name': 'Intro to ML:Image Processing', 'status': ''},
        {'id': 86, 'name': 'Google Developer Essentials', 'status': ''},
        {'id': 87, 'name': 'VM Migration', 'status': ''},
        {'id': 88, 'name': 'Cloud Healthcare API', 'status': ''},
        {'id': 90, 'name': 'Understanding Your Google Cloud Costs', 'status': ''},
        {'id': 95, 'name': 'Using the Cloud SDK Command Line', 'status': ''},
        {'id': 96, 'name': 'DevOps Essentials', 'status': ''},
        {'id': 97, 'name': 'Optimizing Your GCP Costs', 'status': ''},
        {'id': 98, 'name': 'Google Cloud Run Serverless Workshop', 'status': ''},
        {'id': 99, 'name': 'Asylo - Practical Confidential Computing with Enclaves', 'status': ''},
        {'id': 100, 'name': 'Anthos:Service Mesh', 'status': ''},
        {'id': 101, 'name': 'Applied Data:Blockchain', 'status': ''},
        {'id': 103, 'name': 'Creating with Google Maps', 'status': ''},
        {'id': 105, 'name': 'Apigee Basic', 'status': ''},
        {'id': 106, 'name': 'Apigee Advanced', 'status': ''},
      ]};

    // Query Database
    const lastLab = await qdb.labs.bulkAdd(qldata.labs);
    console.log(`Done adding ${qldata.labs.length} labs to the Dexie database`);
    console.log(`Last lab's id was: ${lastLab}`);
    const lastQuest = await qdb.quests.bulkAdd(qldata.quests);
    console.log(`Done adding ${qldata.quests.length} quests to the Dexie database`);
    console.log(`Last quest's id was: ${lastQuest}`);
  }

  /**
   * Load Database when the Program Starts
   */
  async function loadDB() {
    if (!(await Dexie.exists(qdb.name))) {
      console.debug('qdb does not exist. Initialize a new database...');
      await initDB().catch(Dexie.BulkError, function(e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error(e.failures.length + ' items did not succeed.' );
      });
    }
    if (!qdb.isOpen()) {
      await qdb.open();
      if (isDebugMode) {
        console.log('qdb - set open');
        console.log('Found database: ' + qdb.name);
        console.log('Database version: ' + qdb.verno);
      }
    };
    //
    // Fetch Stored Data as Temporary Datasets
    //
    tmpdb.labs = await qdb.table('labs').toArray();
    tmpdb.quests = await qdb.table('quests').toArray();
  }

  /**
   * Create a new db record.
   * @param {Object} type - The type of the new record.
   * @param {number} id - The id of the new record.
   * @param {Object} obj - The object to store.
   * @return {Object} The new database object.
   */
  async function createRecord(type, id, obj) {
    obj.id = parseInt(id);
    const added = await qdb.table(type + 's').add(obj);
    if (added) {
      console.log(`Added a ${type} record with ${JSON.stringify(obj)} to the database.`);
    }
    return added;
  }

  /**
   * Update a single db record.
   * @param {Object} type - The type of the new record.
   * @param {number} id - The id of the new record.
   * @param {Object} obj - The object to store.
   * @return {Object} The updated database object.
   */
  async function updateRecordById(type, id, obj) {
    id = parseInt(id);
    const updated = await qdb.table(type + 's').update(id, obj);
    if (updated) {
      console.log(`Updated a ${type} record:${id} with ${JSON.stringify(obj)} to the database.`);
    }
    return updated;
  }

  /**
   * Batch update Activity records to the database.
   */
  const batchUpdateToDb = async () => {
    const newRecords = document.querySelector('button#db-update').data?.untrackedRecords;
    console.log('Batch Update - start');
    const count = {labs: 0, quests: 0};
    for (const newRecord of newRecords) {
      const id = newRecord.id;
      const type = newRecord.type;
      const tableName = type + 's';
      count[tableName] += 1;
      const updated = await qdb.table(tableName).where('id').equals(id).modify({'status': 'finished'});
      if (updated) {
        console.log(`Updated ${type}: {id: ${id}, name: '${newRecord.name}', 'status': 'finished'}`);
      }
    }
    console.log(`Number of items updated: ${count.quests} quests and ${count.labs} labs`);
    const nUpdate = count.labs + count.quests;
    const snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    if (nUpdate == 0) {
      snackbar.innerHTML = '<p class="alert__message js-alert-message">0 items to update</p>' +
        '<a class="alert__close js-alert-close"><i class="fa fa-times"></i></a>';
    } else {
      let txt = '';
      txt += count.quests > 0 ? `${count.quests} quest` : '';
      txt += ( count.quests > 0 && count.labs > 0 ) ? ' and ' : '';
      txt += count.labs > 0 ? `${count.labs} lab` : '';
      txt += nUpdate > 1 ? ' records' : ' record';
      snackbar.innerHTML = `<p class="alert__message js-alert-message" style="margin-right:16px;">` +
        `Updated ${txt}</p><a class="alert__close js-alert-close">Refresh</a>`;
    }
    snackbar.classList = 'alert alert--fake js-alert alert-success';
    snackbar.style = 'display:flex; max-width:360px; min-width:250px; width:auto; margin-left: -125px;' +
      'margin-bottom:-26px; text-align: center; position: fixed; left: 50%; bottom: 76px;';
    document.body.appendChild(snackbar);
    snackbar.querySelector('.js-alert-close').addEventListener( 'click', function() {
      nUpdate ? location.reload() : snackbar.remove();
    });
    setTimeout(function() {
      nUpdate ? location.reload() : snackbar.remove();
    }, 10000);
    console.log('Batch updated - finished');
  };

  /**
   * Standardize the string to be stored in the database
   * @param {string} title - A lab/quest title
   * @return {string}
   */
  function formatTitle(title) {
    return title.replace(/:\S/g, ': ').replace(/\s\s+/g, ' ').trim();
  }

  /**
   * Status Query Methods.
   * @param {number} id
   * @return {boolean}
   */
  async function getLabStatusById(id) {
    const record = await tmpdb.labs.filter((record) => {
      return id == record.id;
    })[0];
    try {
      return await record.status;
    } catch (e) {
      // console.error (`${e}\nWhen handling lab id: "${id}"`);
      console.warn(`No lab record has an ID of ${id} in the database`);
      return null;
    }
  }

  /**
   * Retrieve a lab record from the database by passsing the title.
   * @param {string} title - A lab title.
   * @return {Object|null} A lab record or null if not found.
   */
  async function getLabByTitle(title) {
    const formattedTitle = formatTitle(title);
    //
    const record = await tmpdb.labs.filter((record) => {
      return record.name == formattedTitle;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      console.warn(`No lab record named "${title}" in the database`);
      return null;
    }
  }

  /**
   * Retrieve a lab record from the database by passsing the ID.
   * @param {number} id - A lab identifier.
   * @return {string|null} The lab status or null if not found.
   */
  async function getQuestStatusById(id) {
    const record = await tmpdb.quests.filter((record) => {
      return id == record.id;
    })[0];
    try {
      return await record.status;
    } catch (e) {
      console.warn(`No quest record has an ID of ${id} in the database`);
      return null;
    }
  }

  /**
   * Retrieve a quest record from the database by passsing the title.
   * @param {string} title - A quest title.
   * @return {Object|null} A quest record or null if not found.
   */
  async function getQuestByTitle(title) {
    const formattedTitle = formatTitle(title);
    const record = await tmpdb.quests.filter((record) => {
      return record.name == formattedTitle;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      console.warn(`No quest record named "${title}" in the database`);
      return null;
    }
  }

  //
  // Annotation Methods
  //

  /**
    * Set the background color of an element by a predefined color key.
    * @param {Object} element - A DOM element
    * @param {string} colorKey - A key from colorMAP
    * @return {string} A hex color code from colorMAP
    */
  function setBackgroundColor(element, colorKey) {
    const colorMap = {
      'green': '#efe',
      'yellow': '#ffc',
      'purple': '#fef',
      'red': '#fdd',
    };
    if (colorKey in colorMap === false) {
      return null;
    };
    const color = colorMap[colorKey];
    element.style.background = color;
    return color;
  }

  /**
    * Set the background color of an element by a predefined color key.
    * @param {Object} element - A DOM element.
    * @param {string} iconKey - A key from iconMap.
    * @param {Object} options - The key of icon format to load,
    *           where 0 specifies for icon font and 1 for SVG image.
    * @return {string} The XML code of a SVG from iconMap.
    */
  function appendIcon(element, iconKey, options={}) {
    const formatKey = options.format_key || 0;
    const elementType = options.elementType || 'p';
    const beforeIcon = options.before || '';
    const iconMap = {
      check: {
        0: '<i class="fas fa-check-circle" style="color:green"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="check-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="green" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>',
      },
      game: {
        0: '<i class="fas fa-gamepad" style="color:purple"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="gamepad" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 640 512" width="24" height="19"><path fill="purple" d="M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z"></path></svg>',
      },
      new: {
        0: '<i class="material-icons" style="color:orange">fiber_new</i>',
        1: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" width="24px" height="24px" fill="orange"><g><rect fill="none" height="24" width="24" x="0"/></g><g><g><g><path d="M20,4H4C2.89,4,2.01,4.89,2.01,6L2,18c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V6C22,4.89,21.11,4,20,4z M8.5,15H7.3 l-2.55-3.5V15H3.5V9h1.25l2.5,3.5V9H8.5V15z M13.5,10.26H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4V10.26z M20.5,14 c0,0.55-0.45,1-1,1h-4c-0.55,0-1-0.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25V14z"/></g></g></g></svg>',
      },
      search: {
        0: '<i class="fas fa-search"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="#39c" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>',
      },
      warning: {
        0: '<i class="fas fa-exclamation-triangle"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="exclamation-triangle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="16"><path fill="orange" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>',
      },
    };
    if (iconKey in iconMap === false) {
      return null;
    };
    const icon = iconMap[iconKey][formatKey];
    const newElm = document.createElement(elementType);
    newElm.classList = 'qclt-icon';
    newElm.style.height = 0;
    newElm.innerText = beforeIcon;
    newElm.innerHTML += icon;
    element.appendChild(newElm);
    return icon;
  }

  /**
    * Scan through each activity card on a page, get the db record
    * by activity ID and label the recorded status on each card.
    */
  async function trackActivityCards() {
    const cards = document.querySelectorAll('ql-activity-card');
    for (const card of cards) {
      const type = card.getAttribute('type');
      const id = card.getAttribute('path').match(/\/(\d+)/)[1];
      const shadow = card.shadowRoot.querySelector('ql-card');
      const options = {format_key: 1};
      switch (type) {
        case 'lab':
          switch (await getLabStatusById(id)) {
            case 'finished':
            // Annotate as a Completed Lab
              appendIcon(shadow, 'check', options);
              continue;
              break;
            case null:
            // Append New Icon for unregistered Activity
              appendIcon(shadow, 'new', options);
              break;
          };
          break;
        case 'quest':
          switch (await getQuestStatusById(id)) {
            case 'finished':
            // Annotate as a Completed Quest
              appendIcon(shadow, 'check', options);
              continue;
              break;
            case null:
              // Append New Icon for unregistered Activity
              appendIcon(shadow, 'new', options);
              break;
          };
          break;
        default:
          break;
      };
    };
  }

  /**
   * Label a lab page title based on the recorded status from the database.
   * @param {number} id - The id to query the record from the database.
   */
  async function trackLabTitle(id) {
    const el = document.querySelector('div.header__title > h1');
    const title = el.innerText;
    const options = {elementType: 'span', before: ' '};
    switch (await getLabStatusById(id)) {
      case 'finished':
        // Annotate as Completed
        setBackgroundColor(el, 'green');
        appendIcon(el, 'check', options);
        updateRecordById('lab', id, {'name': formatTitle(title)});
        break;
      case null:
        // Annotate as Unregistered;
        setBackgroundColor(el, 'yellow');
        appendIcon(el, 'new', options);
        createRecord('lab', id, {'name': formatTitle(title), 'status': ''});
        break;
    };
  }

  /**
   * Label a quest page title based on the recorded status from the database.
   * @param {number} id - The id to query the record from the database.
   */
  async function trackQuestTitle(id) {
    const el = document.querySelector('.ql-headline-1');
    const title = el.innerText;
    const options = {elementType: 'span', before: ' '};
    switch (await getQuestStatusById(id)) {
      case 'finished':
        // Annotate as Completed
        setBackgroundColor(el, 'green');
        appendIcon(el, 'check', options);
        updateRecordById('quest', id, {'name': formatTitle(title)});
        break;
      case null:
        // Annotate as Unregistered;
        setBackgroundColor(el, 'yellow');
        appendIcon(el, 'new', options);
        createRecord('quest', id, {'name': formatTitle(title), 'status': ''});
        break;
    };
  }

  /**
   * Extract ids from the title links and label the titles based on the
   * recorded status from the database.
   * @param {Object[]} titles - The DOM elements that contain lab/quest titles.
   */
  async function trackListOfTitles(titles) {
    for (const title of titles) {
      const matches = title.innerHTML.match(/data-type="(.+)" \D+(\d+)/);
      if (matches == null) {
        continue;
      };
      const id = matches[2];
      const type = matches[1].toLowerCase();
      const options = {before: ' '};
      switch (type) {
        case 'lab':
          // tracking a lab on catalog page
          switch (await getLabStatusById(id)) {
            case 'finished':
            // Annotate as a Completed Lab
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              continue;
              break;
            case null:
            // Annotate as Unregistered
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          };
          break;
        case 'quest':
          // tracking a quest on catalog page
          switch (await getQuestStatusById(id)) {
            case 'finished':
            // Annotate as a Completed Quest
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              continue;
              break;
            case null:
            // Annotate as Unregistered
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          };
          break;
      };
    };
  }

  /**
    * Create the DOM element of the icon buton to run database update.
    * @param {Object} dataObj - A data object from trackActivities().
    * @return {Element} A button element for triggering database update.
    */
  const createUpdateButton = (dataObj) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'db-update';
    button.classList = 'db-update-button mdl-button mdl-button--icon' +
                      ' mdl-button--primary mdl-js-button mdl-js-ripple-effect';
    button.title = 'Update Database Records';
    button.innerHTML = '<i class="material-icons">sync</i>';
    button.addEventListener('click', batchUpdateToDb);
    button.setAttribute('data-untracked-records', JSON.stringify(dataObj.data.untrackedRecords));
    button.setAttribute('data-unregistered-records', JSON.stringify(dataObj.data.unregisteredRecords));
    button.data = dataObj.data;
    button.disabled = dataObj.counts.untrackedRecords === 0;
    return button;
  };

  /**
   * Create a button group elememt.
   * Append an array of elements as the child elements of the button group.
   * @param {Element[]} children - The child elements.
   * @return {Element} The button group element.
   */
  const createButtonGroup = () => {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-group qclt-button-group';
    buttonGroup.style.cssText = 'margin-left: auto';
    return buttonGroup;
  };

  const createActivitesPagination = (onPage) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const perPage = parseInt(params.get('per_page')) || 25;
    // params.set('per_page', 100);
    const currentPage = parseInt(params.get('page')) || 1;
    const pagination = document.createElement('div');
    pagination.className = 'pagination__navigation';
    if (currentPage == 1) {
      pagination.innerHTML = '<span class="previous_page disabled" aria-disabled="true">' +
        '<i class="material-icons" aria-label="Previous page">navigate_before</i></span>';
    } else {
      const previousPage = document.createElement('a');
      previousPage.className = 'previous_page';
      previousPage.rel = 'prev';
      params.set('page', currentPage - 1);
      url.search = params.toString();
      previousPage.href = url.toString();
      previousPage.innerHTML = '<i class="material-icons" aria-label="Previous page">navigate_before</i>';
      pagination.appendChild(previousPage);
    }
    if (perPage > onPage) {
      pagination.innerHTML += '<span class="next_page disabled" aria-disabled="true">' +
            '<i class="material-icons" aria-label="Next page">navigate_next</i></span>';
    } else {
      const nextPage = document.createElement('a');
      nextPage.className = 'next_page';
      nextPage.rel = 'next';
      params.set('page', currentPage + 1);
      url.search = params.toString();
      nextPage.href = url.toString();
      nextPage.innerHTML = '<i class="material-icons" aria-label="Next page">navigate_next</i>';
      pagination.appendChild(nextPage);
    }
    return pagination;
  };

  /**
   * Append a search link as the child of a givn element.
   * @param {Element} el - A DOM element.
   * @param {string} searchTerm - Search keywords.
   * @return {Element} An anchor link element.
   */
  const appendSeachLink = (el, searchTerm) => {
    const aTag = document.createElement('a');
    aTag.href = `${CLOUD_SKILLS_BOOST_BASE_URL}/catalog?keywords=${encodeURIComponent(searchTerm)}`;
    aTag.style.paddingLeft = '0.25em';
    el.appendChild(aTag);
    return aTag;
  };

  /**
    * Extract and handle the data from an Activities table.
    * @return {Object[]} JSON-formatted data from the Activity table
    */
  const parseActivities = () => {
    // Tracking tables under the My Learning section
    const qlTable = document.querySelector('ql-table');
    return qlTable ? qlTable.data : null;
  };

  /**
    * Track and annotate each activity row based on the data attributes and
    * the database records.
    * @param {Object[]} records - JSON-formatted data from the Activity table.
    * @return {number} Number of activity.
    */
  const trackActivities = async (records) => {
    const staging = {
      untrackedRecords: [],
      unregisteredRecords: [],
    };
    const options = {format_key: 1, elementType: 'span', before: ' '};
    const statusHandler = {
      // Annotate a record marked as finished in database
      'finished': (el, record, type) => {
        setBackgroundColor(el, 'green');
        el.classList.add(`completed-${type}`);
      },
      // Annotate a record not updated in database
      '': (el, record, type) => {
        setBackgroundColor(el, 'yellow');
        el.classList.add(`untracked-${type}`);
        staging.untrackedRecords.push({type, ...record});
      },
      // Annotate an unregistered record
      'null': (el, record, type) => {
        setBackgroundColor(el, 'yellow');
        const col1 = el.children[0];
        const col2 = el.children[1];
        const searchIcon = appendSeachLink(col2, col1.innerText);
        appendIcon(searchIcon, 'search', {format_key: 1, elementType: 'span'});
        appendIcon(col2, 'warning', options);
        el.classList.add(`new-${type}`);
        staging.unregisteredRecords.push({type, record});
      },
    };
    const typeHandler = (type) => {
      const handlerObj = {
        /* Change the background in purple color, and add a Gamepad
          icon to the second column to the row of a Game record.    */
        'game': (el) => {
          setBackgroundColor(el, 'purple');
          appendIcon(el.children[1], 'game', options);
          el.classList.add('completed-game');
        },
        'lab': async (el, name, passed) => {
          const record = await getLabByTitle(name);
          const handler = statusHandler[record.status];
          if (passed) {
            handler(el, record || name, 'lab');
          } else {
            setBackgroundColor(el, 'red');
          }
          return record;
        },
        'quest': async (el, name) => {
          const record = await getQuestByTitle(name);
          const handler = statusHandler[record.status];
          handler(el, record || name, 'quest');
          return record;
        },
      };
      const dummyFunc = () => {
        return null;
      };
      return handlerObj[type] || dummyFunc;
    };
    const qlTable = document.querySelector('ql-table');
    if (qlTable) {
      const rows = qlTable.shadowRoot.querySelectorAll('tbody > tr');
      for (const [i, record] of records.entries()) {
        const type = record.type.toLowerCase();
        const name = record.name;
        const passed = record.passed;
        const row = rows[i];
        const handler = typeHandler(type);
        await handler(row, name, passed);
      };
      if (isDebugMode) {
        console.table(staging.untrackedRecords);
        console.table(staging.unregisteredRecords);
      }
      return {
        counts: {
          rows: rows.length,
          untrackedRecords: staging.untrackedRecords.length,
          unregisteredRecords: staging.unregisteredRecords.length,
        },
        data: {
          untrackedRecords: staging.untrackedRecords,
          unregisteredRecords: staging.unregisteredRecords,
        },
      };
    }
    return {
      counts: {
        rows: 0,
        untrackedRecords: 0,
        unregisteredRecords: 0,
      },
      data: {},
    };
  };

  /**
   * Select the handler for a specific URL path.
   * @param {string} path - A path name, e.g. '/', '/catalog'.
   * @return {Object} The handler object.
   */
  const router = (path) => {
    const m = path.match(/^(\/\w+)\/(\d+)$/);
    const route = m ? m[1] : path;
    const handler = {
      '/': {
        identifier: 'home',
        exec: async () => {
          console.debug('Tracking card data on Home');
          await trackActivityCards();
        },
      },
      '/catalog': {
        identifier: 'catalog',
        exec: async () => {
          console.debug('Tracking data on Catalog');
          const titles = document.querySelectorAll('.catalog-item__title');
          await trackListOfTitles(titles);
        },
      },
      '/focuses': {
        identifier: 'lab',
        exec: async () => {
          console.debug('Tracking a lab page');
          const id = m[2];
          await trackLabTitle(id);
        },
      },
      '/profile/activity': {
        identifier: 'activities',
        exec: async () => {
          console.debug('Tracking activity data on Profle');
          const qlData = parseActivities();
          const results = await trackActivities(qlData);
          const button = createUpdateButton(results);
          button.style.cssText = 'margin: auto 0 auto auto';
          const pagination = createActivitesPagination(results.counts.rows);
          const buttonGroup = createButtonGroup();
          pagination.style.cssText = 'margin: auto 12px auto 36px';
          const activityFilters = document.querySelector('#learning_activity_search .filters');
          buttonGroup.appendChild(button);
          buttonGroup.appendChild(pagination);
          activityFilters.appendChild(buttonGroup);
          const clonedGroup = buttonGroup.cloneNode('true');
          clonedGroup.style.cssText = 'margin-top: 16px';
          const profileTabs = document.querySelector('.profile-tabs');
          profileTabs.appendChild(clonedGroup);
        },
      },
      '/quests': {
        identifier: 'quest',
        exec: async () => {
          console.debug('Tracking a quest page');
          const id = m[2];
          await trackQuestTitle(id);
          const titles = document.querySelectorAll('.catalog-item__title');
          await trackListOfTitles(titles);
        },
      },
    };
    return (route in handler) ? handler[route] : null;
  };

  /**
   * Main Function of the Tracking Program
   */
  async function main() {
    // Load database
    await loadDB();
    // Select process based on the URL path
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const handler = router(pathname);
    // Start processing DOM
    await handler?.exec();

    tmpdb = [];
    console.debug('Tracking - end');
  }

  //
  // Call and Catch the Main Function of the Program
  //
  main().catch((e) => {
    // Dexie.MissingAPIError
    console.error(e);
  });
})();
