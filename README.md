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

## notice on armbian

### npm install
installing libasound2-dev could be needed for node-gyp to compile the midi package

```
apt install libasound2-dev
```

### bluetooth setup
the source for bluez (to compile with ble-midi enabled) is [https://www.kernel.org/pub/linux/bluetooth/bluez-5.66.tar.xz](https://www.kernel.org/pub/linux/bluetooth/bluez-5.66.tar.xz) or, better, using the ftonello fork below

### bluez

```
git clone https://github.com/ftonello/bluez/ --branch midi-peripheral bluez
cd bluez
./bootstrap
./configure --enable-midi --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var
make
make install
apt-get install --reinstall bluez
```
### btmidi-server

```
make tools/btmidi-server
sudo cp tools/btmidi-server /usr/bin/btmidi-server
```
Then it can be started for example like this:

```
sudo btmidi-server -v -n "My Banana BLE MIDI"
```

