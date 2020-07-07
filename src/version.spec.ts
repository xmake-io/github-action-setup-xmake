jest.mock('./git', () => ({
    lsRemote(repo: Repo) {
        if (repo === 'xmake-io/xmake')
            return {
                heads: {
                    dev: 'e3b63b2f0103855c940fa8683610cd02895450d1',
                    master: 'efad01e547f30d66d90e486c91c3afa0dbaceed3',
                    test: '18f0605f2e1764d4c07fa4f9fc24274275e1562c',
                },
                tags: {
                    'v1.0.1': '723ec3e970e17f48a601fe2a919b9802b5e516fa',
                    'v1.0.2': '84fa20ca3ded99b9667609c5cb2e56b2308c8e4b',
                    'v1.0.3': 'e56812a09d3677957c41bccc8988599208e3b49a',
                    'v1.0.4': '825dda9d93448ba783e18f7947eef0b4eb07942e',
                    'v2.0.1': '432fd6a40018f4c29e08f1d4cadf1ccc387a0cff',
                    'v2.0.2': 'd24fcddbc2f1093f3943a917d99c5a8989ef2644',
                    'v2.0.3': 'b5f21a05b1cdaf46314238b4cc665976294df1da',
                    'v2.0.4': '2b15a1b5b149e5156e22358f3d29b4de63473376',
                    'v2.0.5': 'b168ce05d763957ed05844141d77d155bf842e7a',
                    'v2.1.1': '5ba22ca230c3f3f9477491df6d39f11d53132fb1',
                    'v2.1.2': 'bf69a2413117cf21c53bde1edbda713e77d4fd9b',
                    'v2.1.3': '248b2cc8a96d41445a2e46d259d14fea8e4203ec',
                    'v2.1.4': '1d94a23a7db35631f4b33b8b0b3968d0e62ffe2a',
                    'v2.1.5': '72f68f941f9b6d07f71811fe403a2dc178270af0',
                    'v2.1.6': '7ea60d24da152469258a4cb35b3ce591ea2fd961',
                    'v2.1.7': 'a04725662933fbbe3ad4a319d03267fc32907242',
                    'v2.1.8': '6c3f42dad5840210ee7294ca295f6c7b18c32291',
                    'v2.1.9': '0f1e8530e89a9432678ed6fe4fef25d0485d1293',
                    'v2.2.1': 'f15ff1ca73b02ff5f522c9fe59004331b1b410fb',
                    'v2.2.2': '18a42e0e8980e3edc39198b18c5c4b9a464ea381',
                    'v2.2.3': 'c4d0e69abf2b9caa88b997ca1f2935b6e0b00c9f',
                    'v2.2.5': 'd71a01615883fffa53fbd28e578db14353628a52',
                    'v2.2.6': 'eb60a76b7454975d151f2d8b5d9e19b26d561c2d',
                    'v2.2.7': '72bd93de8dd64cc5de8986860819a5873ce08fe5',
                    'v2.2.8': '6a2e390a79c4f0444a03b566d4bf24849a6ee3a3',
                    'v2.2.9': '4c22b7a7823518d538a81081d2e795b9ce4403e2',
                    'v2.3.1': 'f6155f883fd6377e0ee5002425f84f05eb420bef',
                    'v2.3.2': '31bacc4f76101e6a865ec254c48d8bcba456378f',
                },
                pull: {
                    '8': { head: '7e3ee3281df2b4caffebe25c87e871ba682dd701' },
                    '11': {
                        head: 'a18d2890ee7615f000b3a6b35150733e2e0013e3',
                        merge: 'ac07a6f13d09ba445af6ba403647f09c6f10dc9b',
                    },
                    '23': {
                        head: 'c33fd5a8b3e7ff7692630bbc8f5d5b6166502493',
                        merge: '9041fc8587c9b797440ec2f58deb4626de688010',
                    },
                    '24': { head: '5777dbc4397360e21e26466634cfddc633531054' },
                    '28': {
                        head: 'a3a28f8abdfe8711b2e4d7496ade02e910070e9f',
                        merge: '3bb5cf13cfa93ab186e7df168dce87718914696b',
                    },
                    '29': { head: '9400826a6fb06bbe08c23550c063eddafa65fe4b' },
                    '38': { head: '745c8f9a3ad7d4c0282fcfbb108bfb053864cbbc' },
                    '45': { head: '0a8ae5b98d2297bbad38fbf96cc78b373ac6f4ff' },
                    '52': { head: 'c53c28bc7b0cd59ea984a3c687273aa47d608c2a' },
                    '59': { head: '1e766da707d9b1075144303755f4e772fa33193d' },
                    '61': {
                        head: '75df3c9a5dafac83a8227ce84b004d3450b10c38',
                        merge: '08962c4c13c6eea78e3c840711b030d30afebeb4',
                    },
                    '63': { head: 'c3fc0841da49c875cadf225ed2da2dc624c1c72f' },
                    '65': {
                        head: '7c6dca6fe620ee41cd09162bc31d2ab0ab371832',
                        merge: '8c50b1e623668850f936ff980080425aedb7fac9',
                    },
                    '72': {
                        head: 'db0f89089bab6a8b6444712b48d4e05d36b05bf4',
                        merge: '3cf6fc8c23edfa66dff224e884a7faed8c2ecf02',
                    },
                    '74': { head: 'e9dde75d0f1159fda52b05f10646eae2cbdfc589' },
                    '75': { head: '3b9b9fb9c1c302be15e87ffe47309b2c6bc8eaec' },
                    '76': { head: '630f5f17601e5a35fb8b2e03fd7e3aad7af76c02' },
                    '77': { head: '61ae623bda980eeb65f5f26c86e9a246a43b93cd' },
                    '78': { head: '831481cdfbf0905b543ad503950233d7736b97d6' },
                    '80': { head: '52c8ee6e3a5782f49e19bb1b4b9c8fa79661c0e0' },
                    '81': { head: 'a145b7c6e0e491df3bc96a8b55201bacf6d73c77' },
                    '82': { head: '55c84b7fc414036f783396b8e8f937c032dc2f34' },
                    '84': { head: 'da6e4cce0e4c1736db0898d53c16ac8ca0441846' },
                    '85': { head: '05590ed02faa985c7b358d4c10126db549e50a77' },
                    '90': { head: 'c57aa4cf4463f33d3deaf8d58e42abbbd83b0e1b' },
                    '91': { head: 'f04981e7a207a25ece6047e83ac3c34c8747e89b' },
                    '92': {
                        head: 'b226dc77e49c31bf41ca55440aede275a642cb0a',
                        merge: '02f98269a1d7580621fedd809a182a47bf832dd6',
                    },
                    '93': { head: '37b4a7647163afdd392c7afcc61955244b6117cb' },
                    '97': { head: 'd35751770b68b1daa7154e3dfbae4169e71af4dd' },
                    '98': { head: '3687f2a29216e84aa182738e91bb0046a3950916' },
                    '100': {
                        head: '4f02b28754d131cbc3354a05535382eefd729231',
                        merge: '0cd4dc9a46b7418e8471c758d6003e4e4d34ce87',
                    },
                    '102': {
                        head: '0042b79375fd532220f9e9639ca6dfdc9007265a',
                        merge: '6eceac557545ef3022e7401ef3daff235694fde3',
                    },
                    '103': { head: 'cbd86c9b25592b81dd010b6fa2e7ce52c31f50db' },
                    '104': { head: 'e0be61b29d1d88ad7daa5f876faaf296e5935f9c' },
                    '105': { head: '4456dbd2f7b2f96812ed00d67cf484178375931c' },
                    '107': { head: '3f3b52d9b053a38b38557bc3a3e9aeb75d749350' },
                    '108': { head: 'b54b263ab4f05564cc463a53d1efedc1c3703f2f' },
                    '110': { head: 'b6724648232ed892301457c05cf5ec4deaefc2ed' },
                    '112': { head: 'ba4864ad076d07320b9d0f0b4b11b3b22644031e' },
                    '113': { head: '2cb7a91bf266680266de51636ce6620cbecc9362' },
                    '114': { head: '1ad0641672627b5ae2cc417b73614c6ce842bb12' },
                    '115': { head: '67a5ad78de9453d14b562cd7c3f2a4364e370d24' },
                    '116': { head: '98a844e670ee733c1036947efd9099f7763fb544' },
                    '118': { head: 'f2d1fc547a2f57da992b947cc3b3f615f9f2d34d' },
                    '119': { head: '64645daebde9aceaeea7f24c9156cdaa4ac5e035' },
                    '131': { head: '28353b3a76db9592acb23fed82461c07c8d6265b' },
                    '187': { head: '92ea65b345d93a88777d02cccaedbccb12fe5fc3' },
                    '188': { head: 'be03b89501a829e19932f86f491df80962bfe8d5' },
                    '198': { head: '49298d9ead57f63b85f2a8ad9e072915617cc58d' },
                    '204': {
                        head: 'ac21734c1d1ae754146754f2656451091ff22014',
                        merge: '39fcf9250a92c05eb837f82aefa0e1dc49660518',
                    },
                    '205': { head: 'd74715b3615e171776a6e5b9971d2ec2bff115d5' },
                    '210': { head: '9ee12112e49db451a49a66d77dd2990d9f6ddab9' },
                    '214': { head: 'b5b1c689f508068ffbde704194b08569151e383a' },
                    '215': { head: '05b6182def036b36c8e4aeac8cdc55441fc4a4db' },
                    '216': { head: 'e8af37c32549f54059f6e7635064c623b80c039c' },
                    '217': {
                        head: '905a8607f3f31ab9efeb68684d40df8284683f3a',
                        merge: '2f93475049575ed5e44699daa378239bc141aad3',
                    },
                    '221': { head: 'ca7b50a40cf7c120d49ca8164f9a54c289dd5743' },
                    '228': { head: '92f1645146c22699f4e2b567451f87fb0dbf2fc6' },
                    '231': { head: 'ca72eb0cf60c3e0747444859d9fc738b98ecc4b5' },
                    '235': { head: '69efc61859543613abc7ec553029852cd5693d17' },
                    '245': { head: '5d33e86c3190d37d04ac26da804db3c53218ae7e' },
                    '247': { head: '9ce75001587cc47db9c980dd99ba28d17b9cc7e8' },
                    '248': { head: '8c6cd6b4dc6b6a6b18150480d9711595f0043f26' },
                    '249': { head: 'a7543cbdfa7fcbe04178d53add85de04b54933b7' },
                    '267': { head: '7d0901f3014960bd53afa0918f21c4a53094faad' },
                    '270': { head: 'c584463f1cd693c2a5df78611816697343ac6ac4' },
                    '273': { head: 'da267497a9677d4cfc7175d462494e1334823476' },
                    '276': { head: '8a80645e856deeaa1df5ad6a2ef91a9c4d475cc8' },
                    '282': { head: 'f9df7b9a3594c8613e6f54003add9ffdaa7e4b49' },
                    '286': { head: '4c59f260714576e2c23aa068b4a1beae62756fd3' },
                    '298': { head: '4175116555b4337ad6cd423373462eb9107617ec' },
                    '303': { head: 'f114c56acb0264a094a99ceff5f45735ea17e54c' },
                    '333': { head: '0f2f41de06a0a7e2852ae9d6b01fd8cde6da4965' },
                    '365': { head: '88b7af92f6988abb30b72095592c74a245c06507' },
                    '380': { head: '5462c4ef4fb470c5878a46cb809203fc1459998f' },
                    '381': { head: 'bd186f9cf5a142aec24bf2d17eff4393487fbd87' },
                    '384': { head: 'e3e646d4e39695b398d719c3340345c8f53750bc' },
                    '387': { head: '84a97cf3471a039bbde45491d5db8eb470b3373e' },
                    '392': { head: '4572f4895e11712ba620097cb504195abc060df2' },
                    '394': { head: 'e34797ed62a4f5f7bab841a0982b3138300d637c' },
                    '395': { head: 'c2a04219cf41346bfa2f4871eda8915d43f38f09' },
                    '398': { head: '0e3f93ad95a57e2dbc3360c26292dacb767f8f54' },
                    '402': { head: '9cebcd69efd4587e3ac56b23e488fbbc9b359f48' },
                    '417': { head: '59a6c75f86de2cb080839910fa9395ccf1089083' },
                    '418': { head: 'c2c491ab4bedea3be7b1a6aca8bb4e65a9d763db' },
                    '420': { head: 'c9208456c2d0c8175d19290a50ccb6fdf95139bb' },
                    '421': { head: '82277e5222154ff4463127681f2d18abb07d7f4a' },
                    '422': { head: 'ace80d7f0b4b6e06a53b7d4bbad3eab28cd65915' },
                    '430': { head: '117f22a385f0118eac2aa6ef8fedf4b29062e973' },
                    '431': { head: '52d8932c29ccf051e2cd400493c38ff1c90f4ccb' },
                    '432': { head: '18ac66eebce733b1112b419f9896cdfa2ede395a' },
                    '435': { head: 'acad517e5ce23a82979a87155bb639f91098adaf' },
                    '438': { head: 'b4c94415e8c7ee24cb3f8c0ba6e0536282121adf' },
                    '441': { head: 'a674530614fbce03122c7d9c72712a6e7a23acb4' },
                    '443': { head: '34cf94bc1650a6e909e9fa3ee88d5cc3cb46eec2' },
                    '444': { head: '8049d92b3e9aef35e4f124e5ae361bdd1f5c5435' },
                    '445': { head: '69c93dba3591d9404bc6b38d84aca731db84ad15' },
                    '447': { head: 'a483b7a9f28c232d66a5c7596926e5c31af865e2' },
                    '448': { head: '9c2c26c81c8c43bc1a834522bc085392c766e7e0' },
                    '449': { head: '52f3bbe24e365b28f4bcd1e277d178a2561a1e8b' },
                    '450': { head: 'fddedb324fbff0546c2cbe304fe95c8e254da6fb' },
                    '451': { head: '17332ad1070bb6190bcd24f0a96cca823b4d8d26' },
                    '452': { head: 'b357d95010f883bff0d1a92ba2390f4c0a50e8ec' },
                    '453': { head: '3ac4190baf80ca6734a35acdfd5ac5f089acbe3e' },
                    '454': { head: '3a5a625a1f498350b05eaa70066c9e77e32ee85f' },
                    '455': { head: '98d4504577b586ef2398346a0db2743081cf03a8' },
                    '457': { head: '72f86392dd7bf482f409dfe4dd00219ef422ad9c' },
                    '458': { head: '4e01df47f2e594796ba6b36858cbe924533dd7aa' },
                    '459': { head: '608f198b3ab87f83b2458e58c1f7dcc6a2beebc0' },
                    '460': { head: 'f264f50f6c1ec488c1608bf69c463d57cc7ccca9' },
                    '462': { head: '5d8c5b6d686b802c48ff52bfe72f188c92509f49' },
                    '464': { head: 'f38741505acb528f609a8b269c911fc037a03fcc' },
                    '465': { head: '318bb739dd64d19a4b4d91d8be49b22fc3403cff' },
                    '468': { head: '117c7cc8a9bea5c9ef65bf00689e1917d91571ec' },
                    '470': { head: '9f73278f8f7631bc53daba27ffdf84d96068c562' },
                    '472': { head: '8cd138e181b63fa327b4b3caa3250fb1dce4b407' },
                    '473': { head: '45a4253be8540240758a69eb8c0c103a3edde057' },
                    '475': { head: 'b93b3d0cc8241e099fc508ffb1f9dace6ab8586a' },
                    '476': { head: '639552074da609025ca6609350c90263ebe684e7' },
                    '477': { head: 'dae10753450c75af10c300dbaf00653b15a27e87' },
                    '478': { head: '9ec42e0f156e0f82068eabbab6ccbfd17549486a' },
                    '481': { head: 'b11c6f57662624732501045e6cccf6b6188dacee' },
                    '482': { head: '887d8d84223de495f0442baa9ae143c382747285' },
                    '483': { head: '4cc123809f92db0a32f4fedbcbf4862484406da0' },
                    '484': { head: '7cff50433386d8c7793884cddd1eb6e1c3c2681e' },
                    '485': { head: '9ce1420b43db72da9d6a57bcc3d4ba478d614484' },
                    '486': { head: '18714381a6257fd93c93344cb559fc409f6b1017' },
                    '488': { head: 'ca45f8941e0b69582021d34061873c8752f76154' },
                    '491': { head: 'e7bcde1188f02ac07e64f6b9a798e0b1ca1e049c' },
                    '492': { head: '09f10b74034b040a6cb56640cd2c2f1027051b50' },
                    '495': { head: 'a6396622cdb3af334c1ec044d5a699affa0dccc2' },
                    '496': { head: 'e5ddd73878d170312580a9284edd5521a2115873' },
                    '497': { head: '74909f788acd34051cf4d32e94b5bcfe1f2c292b' },
                    '498': { head: '08c5864bbfcdc8238716ca8929a71554d08dabfd' },
                    '499': { head: 'bc6896917a2e150adb5aa2a063f72fc85d2ab9f5' },
                    '500': { head: 'ff0595d384a9b4e7656e0c44f327f7614e2a8fd6' },
                    '501': { head: '81acc02e79365957d37e98fbe70887edccfebba6' },
                    '503': { head: '145358ba831e7a90f275118a0556787754fe2fa6' },
                    '505': { head: '1cf79ba882fb24eca13829c12f6e39584ccd1f5f' },
                    '506': { head: '49f14868b5fa9bca4aa2f51ea2b70f9edae89cb6' },
                    '507': { head: '726997c8d83f2a9dff3bb96685dd35ea555e7b8c' },
                    '508': { head: 'a99ed5924ed00e195c0dacc036625bdb4d10f9a8' },
                    '509': { head: '7d4023cf698bff82b2c0f2b4aad86286d4890b49' },
                    '510': { head: 'fb9a434ada47e47e543f62e353c7375f93f82c39' },
                    '523': { head: '0bdcae97d8d9b2b3afe725f9b857a9994d3b28fa' },
                    '525': { head: 'ebe4099e7ea32b023edfc7a5559db5d1d5262e20' },
                    '526': { head: '454f1c64dae6c213177007885e54a1ab497f4b1b' },
                    '527': { head: '786c94fb869b6bbcf310e93f3068b795b177fc0b' },
                    '529': { head: 'df6f615305180ef67c9daa25038af1bc91ff44b0' },
                    '530': { head: '4f2e25226853830f157a2da79097c527030d42b4' },
                    '531': { head: '0b57414998b5404f93209f5b06141911cc9af503' },
                    '534': { head: 'bd4181e0321ec9db4dd6b304db51f5cf6566a484' },
                    '537': { head: 'b515795919b7eb114032a441564512645fae489c' },
                    '542': { head: '7ce304f9ee9946471d4ad11e78ea25149a05483f' },
                    '543': { head: 'f6b1a4866e1c73aafe6decdc6bfc1d99653f2b64' },
                    '547': { head: '9943cbae2e39a219cd5f889802d9db11aaefda5c' },
                    '550': { head: '172076db9fa929c5b6dd20a733d15cf28ef092aa' },
                    '551': { head: 'ff103cd4816ca50102c3bc10906695581c734f60' },
                    '552': { head: '99a3da1ff1e25e76a2cbf19f2f3a3ff43b6be013' },
                    '554': { head: '689068989bcda7bd099f920691dc388eae82bd9a' },
                    '557': { head: '416efddbbac77ecad9be41bdafd36bdea89e25d5' },
                    '563': { head: '3d72809db048911efec3d52106dd6968349ef4d1' },
                    '569': { head: 'ce51c2de7c11b6368ce8956329f9ebbe4ffd1b67' },
                    '593': { head: 'f00316a42943a9a75303658f8d646d35f9e8d1b9' },
                    '613': { head: '155deaae3ea36460929db9c8f28f2b97a319f54c' },
                    '625': { head: 'a027cf0843001dd2cb608c1c42cf643f48a56749' },
                    '628': { head: '23ae1e8af491342ef3e4f899ed0bdb5dd1a1284a' },
                    '631': { head: '30d4183095aa5dcdb9cbe00b1b48e45ca31424fe' },
                    '633': { head: '54ba9a0faf46957c3da37366119e0dab52fc02cc' },
                    '642': { head: 'c68a8ac90d822f74478cc36b6ba5a7e9ac225ee9' },
                    '655': { head: '6da12e9e3387be62b5b00cba64d1fb4d2e1ac140' },
                    '664': { head: 'e011000482dccb3e215d0eb895e280de6cda627e' },
                    '667': { head: 'dc25ac7a87256a0470f523017ee790b29e9b6f2d' },
                    '669': { head: 'd0b39e229426a336f71a0cc24f6319a47e2ce975' },
                    '671': { head: 'aa0cd8e58d2effab424214d12ab2122ff39a0f4a' },
                    '672': { head: '0cb3bd5f5aa0605835d7c785bd58e9d75b362fdd' },
                    '673': { head: '97b0e9c8e673325545d2e55288d66a2dd99d1cc0' },
                    '674': { head: '5d7a6efa13021da59a370bb011f4caf494b35da3' },
                    '678': { head: '98d788b6df2e95725e2435fff8469deb3ff74e8c' },
                    '679': { head: 'ea8ee4a153af424e238ed0e0772c32bfb0a881b1' },
                    '682': { head: 'fd12dc4bd31ebe9dc6370ab150c39441ce4d6061' },
                    '686': { head: 'd76b2b96872e3860af34b3256bc1df2189835829' },
                    '703': { head: '3b0f6e396c4a1d53b1b046c416681da6229fbdce' },
                    '708': { head: 'af28dba1f52990cb7b6c3c8f69f1f1bcf017c90a' },
                },
            };
        if (repo === 'my/xmake')
            return {
                heads: {
                    dev: 'e3b63b2f0103855c940fa8683610cd02895450d1',
                    master: 'efad01e547f30d66d90e486c91c3afa0dbaceed3',
                    'patch-1': '77cd51991f8b9c76e54d668103a06ca6c597e64a',
                },
                tags: {},
                pull: {},
            };
    },
}));
import { selectVersion } from './versions';
import { Repo } from './interfaces';

describe('selectVersion', () => {
    it('should return correct version for latest', async () => {
        await expect(selectVersion('latest')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'v2.3.2',
            sha: '31bacc4f76101e6a865ec254c48d8bcba456378f',
            type: 'tags',
        });
    });
    it('should throw for no matched', async () => {
        await expect(selectVersion('0.2.3')).rejects.toThrowError('No matched releases of xmake-version 0.2.3');
        await expect(selectVersion('v0.2.3')).rejects.toThrowError('No matched releases of xmake-version 0.2.3');
        await expect(selectVersion('<0.2.3 > 0.1')).rejects.toThrowError(
            'No matched releases of xmake-version <0.2.3 >=0.2.0',
        );
    });
    it('should return correct version for given', async () => {
        await expect(selectVersion('v1.0.1')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'v1.0.1',
            sha: '723ec3e970e17f48a601fe2a919b9802b5e516fa',
            type: 'tags',
        });
    });
    it('should return correct version for range', async () => {
        await expect(selectVersion('>=2')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'v2.3.2',
            sha: '31bacc4f76101e6a865ec254c48d8bcba456378f',
            type: 'tags',
        });
    });

    it('should return correct branch', async () => {
        await expect(selectVersion('branch@master')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'master',
            sha: 'efad01e547f30d66d90e486c91c3afa0dbaceed3',
            type: 'heads',
        });
    });

    it('should throw not found branch', async () => {
        await expect(selectVersion('branch@xxx')).rejects.toThrowError(`Branch xxx not found`);
    });

    it('should return correct pr', async () => {
        await expect(selectVersion('pr@708')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'pr#708',
            sha: 'af28dba1f52990cb7b6c3c8f69f1f1bcf017c90a',
            type: 'pull',
        });
    });

    it('should throw not found pr', async () => {
        await expect(selectVersion('pr@999')).rejects.toThrowError('Pull requrest #999 not found');
    });

    it('should throw invalid pr', async () => {
        await expect(selectVersion('pr@xxx')).rejects.toThrowError(
            'Invalid pull requrest xxx, should be a positive integer',
        );
    });

    it('should return branch of sha', async () => {
        await expect(selectVersion('sha@efad01e547f30d66d90e486c91c3afa0dbaceed3')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'master',
            sha: 'efad01e547f30d66d90e486c91c3afa0dbaceed3',
            type: 'heads',
        });
    });

    it('should return tag of sha', async () => {
        await expect(selectVersion('sha@31bacc4f76101e6a865ec254c48d8bcba456378f')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'v2.3.2',
            sha: '31bacc4f76101e6a865ec254c48d8bcba456378f',
            type: 'tags',
        });
    });

    it('should return pr merge of sha', async () => {
        await expect(selectVersion('sha@2f93475049575ed5e44699daa378239bc141aad3')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'pr#217',
            sha: '2f93475049575ed5e44699daa378239bc141aad3',
            type: 'pull',
        });
    });

    it('should not return pr head of sha if merge present', async () => {
        await expect(selectVersion('sha@905a8607f3f31ab9efeb68684d40df8284683f3a')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'sha#905a8607f3f31ab9efeb68684d40df8284683f3a',
            sha: '905a8607f3f31ab9efeb68684d40df8284683f3a',
            type: 'sha',
        });
    });

    it('should return pr head of sha', async () => {
        await expect(selectVersion('sha@af28dba1f52990cb7b6c3c8f69f1f1bcf017c90a')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'pr#708',
            sha: 'af28dba1f52990cb7b6c3c8f69f1f1bcf017c90a',
            type: 'pull',
        });
    });

    it('should return correct normalized sha', async () => {
        await expect(selectVersion('sha@Af28dba1f52990cb7b6c3c8f69f1f1bcf017c90b')).resolves.toEqual({
            repo: 'xmake-io/xmake',
            version: 'sha#af28dba1f52990cb7b6c3c8f69f1f1bcf017c90b',
            sha: 'af28dba1f52990cb7b6c3c8f69f1f1bcf017c90b',
            type: 'sha',
        });
    });

    it('should throw invalid length sha', async () => {
        await expect(selectVersion('sha@af28dba1f52990cb7b6c3c8f69f1f1bcf017c90')).rejects.toThrowError(
            'Invalid sha value af28dba1f52990cb7b6c3c8f69f1f1bcf017c90',
        );
    });

    it('should throw invalid char sha', async () => {
        await expect(selectVersion('sha@af28dba1f52990cb7b6c3c8f69f1f1bcf017c90g')).rejects.toThrowError(
            'Invalid sha value af28dba1f52990cb7b6c3c8f69f1f1bcf017c90g',
        );
    });

    it('should return correct repo', async () => {
        await expect(selectVersion('my/xmake#branch@patch-1')).resolves.toEqual({
            repo: 'my/xmake',
            version: 'patch-1',
            sha: '77cd51991f8b9c76e54d668103a06ca6c597e64a',
            type: 'heads',
        });
    });
});
