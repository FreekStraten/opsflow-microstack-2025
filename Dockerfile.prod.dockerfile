FROM node:20

# Gebruik een specifieke Node.js versie voor consistentie
WORKDIR /app

# Kopieer package files eerst (betere Docker layer caching)
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer de rest van de code
COPY . .

# Maak een non-root user voor beveiliging
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser
RUN chown -R nodeuser:nodeuser /app
USER nodeuser

# Expose de poort
EXPOSE 12345

# Start de applicatie
CMD ["npm", "start"]