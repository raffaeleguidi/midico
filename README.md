# midico
A handy nodejs midi router for my nux mg30 using icon g-board midi pedalboard


```
# on a Raspberry PI 3 install latest raspbian/Raspberry PI OS
# install midi pre-requirements
sudo apt-get install libasound2-dev
# install nodejs:
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt install nodejs
sudo npm install pm2@latest -g                          # install PM2 globally and set it up to start at boot 
pm2 startup                                             # set pm2 to start at boot (follow the instructions)
git clone https://github.com/raffaeleguidi/midico.git   # clone the repo
npm install
pm2 start midico.js -o "/dev/null" -e "/dev/null"       # start the midico service without logs
# use midico2.js instead for the onboard footswitches
pm2 save                                                # save the service for boot at startup
```
