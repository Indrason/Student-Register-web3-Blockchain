App = {
  web3Provider: null,
  contracts: {},

  init: async function () {

    return await App.initWeb3();
  },

  initWeb3: async function () {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {

    $.getJSON('StudentRegister.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      App.contracts.StudentRegister = TruffleContract(data);

      // Set the provider for our contract
      App.contracts.StudentRegister.setProvider(App.web3Provider);

    });

  },

  // Button click function for 'Add Student' button
  btn_addStudent_menu: function () {
    $('#addStudent').show();
    $('#viewStudent').hide();
    $('#add_err').text('');
  },

  // Button click function for 'View Student' button
  btn_viewStudent_menu: function () {
    $('#viewStudent').show();
    $('#addStudent').hide();
    $('#view_result').hide();
    $('#view_err').text('');

  },

  // Button click function for 'ADD' button to add student details
  btnAddStudent: function () {
    $('#add_err').text('');

    // Fetching the values from the input fields
    var rollno = $('#new_roll').val();
    var name = $('#new_name').val();
    var address = $('#new_address').val();
    var percentage = $('#new_percentage').val();

    if (rollno == "" || name == "" || address == "" || percentage == "") {
      $('#add_err').text('* Kindly fill all the fields !');
    }
    else {
      // Fetching account address
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        account = accounts[0];
        // Calling checkStudent function to check whether the student has already exist or not
        App.contracts.StudentRegister.deployed().then(function (instance) {

          return instance.checkStudent(parseInt(rollno));

        }).then(function (result) {
          if (result == 1) {
            $('#add_err').text('* Roll Number already exists !');
          }
          else {
            // Calling addStudent function to add the student details
            App.contracts.StudentRegister.deployed().then(function (instance) {

              return instance.addStudent(parseInt(rollno), name, address, parseInt(percentage), { from: App.account });

            }).then(function (result) {
              $('#add_err').text('Student Record Successfully Added');
              console.log(result);

            }).catch(function (err) {
              $('#add_err').text('* Unable to save record. Please try again!');
              console.log(err.message);
            });
          }

        }).catch(function (err) {
          $('#add_err').text('* Unable to save record. Please try again!');
          console.log(err.message);
        });

      });

    }
  },

  // Button click function for 'VIEW' button to show the student details
  btnViewStudent: function () {
    $('#view_err').text('');

    var rollno = $('#view_roll').val();
    if (rollno == "") {
      $('#view_err').text('* Kindly enter Roll Number to proceed !');
    }
    else {
      // Calling checkStudent function to check whether the student has already exist or not
      App.contracts.StudentRegister.deployed().then(function (instance) {
        return instance.checkStudent(parseInt(rollno));

      }).then(function (result) {
        if (result == 0) {
          $('#view_err').text('* Roll Number does not exist !');
          $('#view_result').hide();
        }
        else {
          // Calling showStudent function to fetch the details of the student
          App.contracts.StudentRegister.deployed().then(function (instance) {
            return instance.showStudent(parseInt(rollno));

          }).then(function (result) {
            //console.log(result);
            // Displaying the values
            $('#view_rollno').text(result[0].toNumber());
            $('#view_name').text(result[1]);
            $('#view_address').text(result[2]);
            $('#view_percentage').text(result[3].toNumber() + ' %');
            $('#view_result').show();

          }).catch(function (err) {
            $('#view_err').text('* Something went wrong, Please try again !');
            console.log(err.message);
            $('#view_result').hide();

          });
        }
      }).catch(function (err) {
        $('#view_err').text('* Something went wrong, Please try again !');
        console.log(err.message);
      });
    }
  }
};

$(function () {

  $('#viewStudent').hide();
  $(window).load(function () {
    App.init();
  });
});

