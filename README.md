MX Liquidity Intelligence
Real-time DeFi Risk Analytics & AI Strategy Agent for MultiversX

Overview
MX Liquidity Intelligence is a decentralized finance (DeFi) decision-support tool built for the MultiversX ecosystem. It bridges the gap between raw blockchain data and actionable investment intelligence. The platform provides real-time liquidity pool analytics, impermanent loss simulations, and an autonomous risk-auditing agent.

Core Features
Liquidity Opportunity Aggregator: Indexes real-time data from MultiversX DEX protocols, displaying TVL, APR, and dynamic Risk Scores.

Smart IL Simulator: A mathematical modeling tool that allows users to project Impermanent Loss based on predicted price shifts.

AI Portfolio Risk Agent: An automated auditing system that analyzes wallet addresses to identify concentration risk and provides rebalancing strategies.

Live Market Integration: Combines on-chain account data with real-time market prices via the CoinGecko API.

Technical Architecture
Frontend
Framework: HTML5, CSS3 (Custom Variables), and Vanilla JavaScript.

Visualization: Chart.js for historical price ratio tracking.

Blockchain Interaction: MultiversX SDK-dApp and REST API integration for Devnet.

Backend
Runtime: Node.js with Express.

Database: SQLite3 for local indexing of pool history.

Data Sourcing: Automated indexing of xExchange liquidity pairs and account metadata.

AI Implementation
The project implements a deterministic AI Risk Agent. This agent monitors portfolio health by calculating the Gini coefficient of asset distribution (Concentration Risk). When a user's exposure to a single volatile asset exceeds a predefined threshold (60%), the agent generates a mitigation strategy to hedge against market volatility.

Installation and Setup
Clone the repository.

Install dependencies: npm install

Initialize the database and start the server: node server.js

Open index.html in a web browser.

Hackathon Track
Primary Track: DeFi

Secondary Track: Infrastructure & Tools

Special Category: AI Implementation

Disclaimer
This project is developed for the MultiversX Build Wars hackathon. All data processed on Devnet is for simulation and testing purposes.