// Store data: products, departments, districts and board pool.
export const PRODUCTS = [
    {id:'p1',name:'Pocket Cassette Player',jp:'カセットプレーヤー',cat:'audio',price:18800,grade:'A',from:'Akihabara',ph:'cassette player',model:'cassette',year:'1988',includes:'Player, belt clip, foam headphones',desc:'Belt-drive pocket player with auto-reverse. Plays type I and type II tapes.',notes:['New drive belt fitted','Heads cleaned and demagnetised','Speed checked against a 3 kHz test tape']},
    {id:'p2',name:'5-inch Portable CRT',jp:'ポータブルテレビ',cat:'tv',price:32000,grade:'B+',from:'Nakano',ph:'small crt tv',model:'crt',year:'1986',includes:'TV, AC adapter',desc:'Five-inch black-and-white set with a fold-out stand. Takes composite video, so it works with consoles and camcorders.',notes:['Tube brightness within spec','Composite input tested','Power board recapped']},
    {id:'p3',name:'Half-Frame Film Camera',jp:'ハーフカメラ',cat:'camera',price:24500,grade:'A',from:'Koenji',ph:'film camera',model:'halfcam',year:'1979',includes:'Camera, wrist strap',desc:'Half-frame 35mm camera: 72 shots from a 36-exposure roll.',notes:['Shutter speeds tested','Light seals replaced','Lens cleaned, no haze']},
    {id:'p4',name:'LCD Handheld Game',jp:'携帯ゲーム',cat:'game',price:6800,grade:'A-',from:'Akihabara',ph:'lcd handheld',model:'handheld',year:'1982',includes:'Handheld, 2× LR43 batteries',desc:'Single-game LCD handheld with a built-in alarm clock.',notes:['All display segments light','Buttons re-contacted','Battery door intact']},
    {id:'p5',name:'Numeric Pager',jp:'ポケベル',cat:'phone',price:4200,grade:'B',from:'Ueno',ph:'pager',model:'pager',year:'1994',includes:'Pager, belt clip',desc:'Numeric pager with a backlit display. Display-only now: the paging networks are shut down.',notes:['Display and backlight tested','Vibrate motor works','Paging networks are offline']},
    {id:'p6',name:'Pink Counter Payphone',jp:'ピンク電話',cat:'phone',price:38000,grade:'B+',from:'Shimokitazawa',ph:'pink payphone',model:'payphone',year:'1983',includes:'Phone, coin box keys, line adapter',desc:'Counter-top coin phone from a closed kissaten, converted to work on a regular home line.',notes:['Converted to a standard phone line','Coin mechanism cleaned','Ringer tested']},
    {id:'p7',name:'MiniDisc Recorder',jp:'MDレコーダー',cat:'audio',price:21000,grade:'A',from:'Nakano',ph:'minidisc recorder',model:'md',year:'1998',includes:'Recorder, remote, one blank disc',desc:'Portable MiniDisc recorder with optical input.',notes:['Records and plays back','Laser power checked','Fresh gumstick battery']},
    {id:'p8',name:'Arcade Stick Panel',jp:'アーケードスティック',cat:'game',price:12400,grade:'A-',from:'Akihabara',ph:'arcade joystick',model:'arcade',year:'1991',includes:'Panel, USB cable',desc:'Control panel pulled from an arcade cabinet and rewired to USB.',notes:['Microswitches replaced','USB encoder fitted','Ball-top stick, six buttons']},
    {id:'p9',name:'Instant Camera',jp:'インスタントカメラ',cat:'camera',price:15600,grade:'B+',from:'Koenji',ph:'instant camera',model:'instant',year:'1984',includes:'Camera, test print',desc:'Instant camera with a built-in flash. Takes current integral film.',notes:['Rollers cleaned','Flash fires','Test shot included']},
    {id:'p10',name:'Front-Load VHS Deck',jp:'ビデオデッキ',cat:'tv',price:9900,grade:'B',from:'Ueno',ph:'vhs deck',model:'vhs',year:'1989',includes:'Deck, remote, RF cable',desc:'Front-loading VHS deck with a jog dial.',notes:['Heads cleaned','New pinch roller','Plays, rewinds and records']},
    {id:'p11',name:'Stereo Boombox',jp:'ラジカセ',cat:'audio',price:26400,grade:'A-',from:'Ueno',ph:'boombox',model:'boombox',year:'1985',includes:'Boombox, AC cable',desc:'Twin-speaker radio cassette recorder with AM/FM and a dubbing deck.',notes:['Both belts replaced','Radio tuner aligned','Speaker cones checked']},
    {id:'p12',name:'Belt-Drive Turntable',jp:'レコードプレーヤー',cat:'audio',price:29800,grade:'A',from:'Kichijoji',ph:'turntable',model:'turntable',year:'1978',includes:'Turntable, new stylus',desc:'Wooden-plinth belt-drive turntable with a straight tonearm.',notes:['New belt and stylus','Speed set for 33 and 45','Tonearm balanced']},
    {id:'p13',name:'Compact Camcorder',jp:'ビデオカメラ',cat:'tv',price:14200,grade:'B+',from:'Koenji',ph:'camcorder',model:'camcorder',year:'1990',includes:'Camcorder, battery, charger',desc:'Hand-held tape camcorder with a black-and-white viewfinder.',notes:['Records and plays back','Fresh battery pack','Viewfinder cleaned']},
    {id:'p14',name:'8mm Film Projector',jp:'映写機',cat:'tv',price:27000,grade:'B',from:'Asakusa',ph:'film projector',model:'projector',year:'1972',includes:'Projector, take-up reel, spare lamp',desc:'Super 8 projector with variable speed and a still-frame mode.',notes:['New drive belt','Lamp tested','Film gate cleaned']},
    {id:'p15',name:'Manual Film SLR',jp:'一眼レフ',cat:'camera',price:34500,grade:'A',from:'Nakano',ph:'film slr',model:'slr',year:'1981',includes:'Body, 50mm lens, strap',desc:'Fully mechanical 35mm SLR with a 50mm f/1.8 lens.',notes:['Shutter speeds tested','Light meter checked','Mirror foam replaced']},
    {id:'p16',name:'Compact Rangefinder',jp:'レンジファインダー',cat:'camera',price:19800,grade:'A-',from:'Koenji',ph:'rangefinder',model:'rangefinder',year:'1976',includes:'Camera, case',desc:'Fixed-lens 35mm rangefinder with a 40mm lens.',notes:['Rangefinder aligned','Light seals replaced','Battery adapter fitted']},
    {id:'p17',name:'8-bit Home Console',jp:'家庭用ゲーム機',cat:'game',price:11800,grade:'B+',from:'Akihabara',ph:'home console',model:'console',year:'1986',includes:'Console, 2 controllers, AV cable',desc:'Cartridge home console with two wired controllers.',notes:['Cartridge slot cleaned','AV output fitted','Controllers re-contacted']},
    {id:'p18',name:'Countertop Mini Cabinet',jp:'ミニ筐体',cat:'game',price:42000,grade:'A-',from:'Akihabara',ph:'mini arcade cabinet',model:'minicab',year:'1993',includes:'Cabinet, power supply',desc:'Bartop arcade cabinet with an LCD panel in place of the original tube.',notes:['New LCD panel','Stick and buttons replaced','Coin door works']},
    {id:'p19',name:'Rotary Desk Phone',jp:'黒電話',cat:'phone',price:8600,grade:'A',from:'Asakusa',ph:'rotary phone',model:'rotary',year:'1975',includes:'Phone, line adapter',desc:'Black rotary desk phone. Works on lines that still accept pulse dialling.',notes:['Bell ringer tested','Dial speed adjusted','Line adapter included']},
    {id:'p20',name:'Flip Phone',jp:'ガラケー',cat:'phone',price:5400,grade:'B',from:'Shimokitazawa',ph:'flip phone',model:'flip',year:'2004',includes:'Phone, charger',desc:'Folding phone with a camera and colour screen. The 3G network is gone, so it works as a camera and alarm clock.',notes:['Screen and hinge checked','New battery','Mobile networks are offline']}
  ];

export const CATEGORIES = [
    {key:'all',en:'All',jp:'全部',can:'#f1ece2'},
    {key:'audio',en:'Audio',jp:'音響',can:'#ff5a9e'},
    {key:'tv',en:'TV & Video',jp:'テレビ',can:'#34d2df'},
    {key:'camera',en:'Cameras',jp:'カメラ',can:'#f0a63a'},
    {key:'game',en:'Games',jp:'ゲーム',can:'#7be36f'},
    {key:'phone',en:'Phones',jp:'電話',can:'#b383ff'}
  ];

export const CONDITION = {'A':'Excellent, light wear','A-':'Very good','B+':'Good, visible wear','B':'Fair, fully working'};

export const ARRIVAL_POOL = [
    ['CASSETTE PLAYER','カセット','AKIHABARA','¥18,800'],['PORTABLE CRT','テレビ','NAKANO','¥32,000'],
    ['HALF-FRAME CAM','ハーフカメラ','KOENJI','¥24,500'],['LCD HANDHELD','携帯ゲーム','AKIHABARA','¥6,800'],
    ['NUMERIC PAGER','ポケベル','UENO','¥4,200'],['MD RECORDER','MDレコーダー','NAKANO','¥21,000'],
    ['PINK PAYPHONE','ピンク電話','SHIMOKITA','¥38,000'],['ARCADE STICK','アケコン','AKIHABARA','¥12,400'],
    ['VHS DECK','ビデオデッキ','UENO','¥9,900'],['INSTANT CAMERA','インスタント','KOENJI','¥15,600'],
    ['CLOCK RADIO','ラジオ','KICHIJOJI','¥7,400'],['8MM PROJECTOR','映写機','ASAKUSA','¥27,000'],
    ['TRANSISTOR RADIO','トランジスタ','ASAKUSA','¥5,600'],['POCKET CALC','電卓','KICHIJOJI','¥3,200']
  ];

export const STATUS_COLORS = {'JUST IN':'#5fe0ea','ON SALE':'#f2b04a','LAST ONE':'#ff6aa6','SOLD OUT':'#77716b'};

export const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const DISTRICTS = {
    akihabara:{en:'Akihabara',jp:'秋葉原',from:'Akihabara',body:"Electric Town's side streets still have parts stalls the size of a cupboard. We buy display units and back stock when they close down."},
    ueno:{en:'Ueno',jp:'上野',from:'Ueno',body:'Under the tracks at Ameyoko, old stalls clear out pagers, radios and phones. Most of our telecom shelf starts here.'},
    asakusa:{en:'Asakusa',jp:'浅草',from:'Asakusa',body:'Family shops on the old shopping streets hand over projectors and transistor radios that have sat in back rooms for decades.'},
    koenji:{en:'Koenji',jp:'高円寺',from:'Koenji',body:'Two stops west on the Chūō line. Estate clearances here are where most of our film cameras come from.'},
    kichijoji:{en:'Kichijoji',jp:'吉祥寺',from:'Kichijoji',body:'Quiet residential estates: clock radios, calculators and the family electronics nobody threw away.'},
    shimokita:{en:'Shimokitazawa',jp:'下北沢',from:'Shimokitazawa',body:'Cafés and bars refitting their interiors. That is where the pink payphones and counter-top sets turn up.'},
    nakano:{en:'Nakano',jp:'中野',from:'Nakano',body:'Home. The shop sits at the end of a back alley a few minutes from the station, and everything is tested on the bench here before it ships.'}
  };

export const SHOP_BLURBS = {audio:'Tape decks, MiniDisc and radios, sorted by format.',tv:'Portable CRTs and VHS decks, all checked with a test signal.',camera:'Film and instant cameras, each with a test roll run through.',game:'LCD handhelds and arcade parts, re-contacted and rewired.',phone:'Pagers and payphones, converted where they can still be used.'};

export const PAY_METHODS = [{key:'cash',jp:'現金',en:'Coins & bills'},{key:'ic',jp:'IC',en:'Transit card'},{key:'card',jp:'クレジット',en:'Credit card'},{key:'qr',jp:'QR',en:'QR pay'}];

export const DEPTS = [
    {key:'audio', en:'Audio', jp:'音響', col:'#ff4f9a', side:-1, z:-16, blurb:'Tape decks, MiniDisc, boomboxes and turntables.'},
    {key:'tv', en:'TV & Video', jp:'テレビ', col:'#2fd3e0', side:1, z:-40, blurb:'Portable CRTs, VHS decks, camcorders and projectors.'},
    {key:'camera', en:'Cameras', jp:'カメラ', col:'#f0a030', side:-1, z:-64, blurb:'Film, instant and rangefinder cameras, each tested with a roll.'},
    {key:'game', en:'Games', jp:'ゲーム', col:'#7cff6b', side:1, z:-88, blurb:'LCD handhelds, home consoles and arcade parts.'},
    {key:'phone', en:'Phones', jp:'電話', col:'#b06bff', side:-1, z:-112, blurb:'Pagers, payphones, rotary and flip phones.'}
  ];

export const QR_CELLS = (() => {
    const n = 21, out = [];
    const fin = (x,y,ox,oy) => { const dx = x-ox, dy = y-oy; if (dx<0||dy<0||dx>6||dy>6) return null; return dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4); };
    for (let y=0;y<n;y++) for (let x=0;x<n;x++) {
      let v = fin(x,y,0,0); if (v === null) v = fin(x,y,14,0); if (v === null) v = fin(x,y,0,14);
      const zone = (x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12);
      if (v === null) v = zone ? false : Math.random() < .48;
      out.push(v);
    }
    return out;
  })();

export const yen = n => '¥' + n.toLocaleString('en-US');
