const sdkApi = require('../../services/sdk.js')
const app = getApp()

Page({

    data: {
        baseInfo: {
            id: '', // the id of a piece data
            userName: '',
            userGender: 2,
            birthData: '',
            eMail: '',
            phoneNumber: '',
            job: '',
            salary: '',
            address: '',
        },
        workInfo: [
            {
                companyName: '',
                datesEmployed: '',
                companyAddress: '',
                employedProfession: '',
                id: null,
            }
        ],
        otherInfo: [
            {
                title0: '',
                content0: '点击输入内容'
            }
        ],
        recordId: null,
        windowHeight: app.globalData.systemInfo.windowHeight, // swiper component's height
        hideWorkDialog: true,
        singleWorkInfo: {
            companyName: '',
            datesEmployed: '',
            companyAddress: '',
            employedProfession: '',
            userName: '',
            phoneNumber: ''
        },
        canBaseSubmit: true,
        canOtherSubmit: true,
        rejectEdit: true, // Other information cannot be saved unless you have edited and saved the basic information
        showDialog: false,
        operationalDataIndex: 0,
        textareaContent: ''
    },

    onLoad: function () {
        let that = this
        that.findBaseInfo()
        // that.findworkInfo()
        // that.findOtherkInfo()
        that.setData({
            windowHeight: app.globalData.systemInfo.windowHeight
        })
    },
    onReady: function () {

    },

    // init user work info data
    findworkInfo (e) {
        sdkApi.findworkInfo({}, res => {
            let objInfo = {
                companyName: '',
                datesEmployed: '',
                companyAddress: '',
                employedProfession: '',
                userName: this.data.baseInfo.userName,
                phoneNumber: this.data.baseInfo.phoneNumber
            }
            if ( res.objects.length > 0) {
                res.objects.forEach(val => {
                    if (val.datesEmployed) {
                        val.datesEmployed = val.datesEmployed.substring(0, 10)
                    }
                })
                res.objects.push(objInfo)
                
                this.setData({
                    'workInfo': res.objects,
                    'hideWorkDialog': true
                })
            } else {
                this.setData({
                    'workInfo': [objInfo]
                })
            }
       })
    },

    // init user other info data
    findOtherkInfo (e) {
        sdkApi.findOtherkInfo({}, res=> {
            if (res.objects.length > 0) {
                if (res.objects[0].id) {
                    this.setData({
                        'recordId': res.objects[0].id
                    })
                }
                let titleArray = []
                let contentArray = []
                for (let i in res.objects[0]) { // loop througth the object
                    if (i.substr(0, 5) === 'title') {
                        titleArray.push({[i]: res.objects[0][i]})
                    }
                    if (i.substr(0, 7) === 'content') {
                        contentArray.push({[i]: res.objects[0][i]})
                    }
                }

                titleArray.forEach((val, index) => { // There are problem with the data order.It't hasn't been solved yet. -- Waiting for optimization
                    Object.assign(val, contentArray[index])
                })

                this.setData({
                    'otherInfo': titleArray
                })
            } else {
                this.setData({
                    'otherInfo': [{
                        title0: '',
                        content0: '点击输入内容'
                    }]
                })
            }
        })
    },

    rejectEditFn () { // 验证基本信息是否已填写并提交
        if (this.data.rejectEdit) {
            app.noneToast('请先完善您的基本信息，再编辑工作信息 @_@')
            return false
        }
        return true
    },
    verificationForm (obj) { // 验证表单信息是否已全部填写
        for (let i in obj) {
            if (obj[i] === '') {
                app.noneToast('请先填写完整信息方可保存 @_@')
                return false
            }
        }
        return true
    },

    // 基本信息
    // base info date picker change event
    handleDateChange (e) {
        this.setData({
            'baseInfo.birthData': e.detail.value
        })
    },

    handlePhoneNumber (e) {
        this.setData({
            'baseInfo.phoneNumber': e.detail.value.replace(/\D/g, '')
        })
    },
    
    // base info submit
    handleBaseFormSubmit (e) {
        if (!this.verificationForm(e.detail.value)) return
        // add userGender object in order to handle the gender option is blank
        let baseInfo = Object.assign({}, this.data.baseInfo, e.detail.value, {userGender: Number(e.detail.value.userGender)})
        this.setData({
            baseInfo: baseInfo
        })
        let params = {
            ...e.detail.value,
            userGender: Number(e.detail.value.userGender)
        }
        if (this.data.canBaseSubmit) {
            this.setData({
                'canBaseSubmit': false
             })
             if (!this.data.baseInfo.id) { // add new user information operation
                sdkApi.addBaseInfo(params, res => {
                    this.successBasicInformation()
                })
    
            } else { // modify information operation
                Object.assign(params, {recordID: this.data.baseInfo.id})
                sdkApi.updateBaseInfo(params, res => {
                    this.successBasicInformation()
                })
    
            }
        }
        
    },
    // reset base information form
    handleBaseFormReset (e) {
        this.setData({
            'baseInfo.userGender': 2,
        })
    },

    successBasicInformation () {
        app.successToast()
        let index = this.data.workInfo.length - 1
        setTimeout(() => {
            this.setData({
                    'canBaseSubmit': true,
                    'rejectEdit': false,
                    ['workInfo[' + index + ']']: { // add a name and a phone information for each blank work information,put into the database later
                    companyName: '',
                    datesEmployed: '',
                    companyAddress: '',
                    employedProfession: '',
                    userName: this.data.baseInfo.userName,
                    phoneNumber: this.data.baseInfo.phoneNumber
                }
            })
        }, 1000)
    },

    // 工作信息
    // click card : tap event
    handleWorkInfoCardTap (e) {
        if (!this.rejectEditFn()) return
        this.setData({
            'hideWorkDialog': false,
            'singleWorkInfo': this.data.workInfo[e.currentTarget.dataset.singleWorkInfo] || this.data.workInfo[this.data.workInfo.length - 1]
        })
    },
    // delete card
    deleteCard (e) {
        let that = this
        sdkApi.deleteWorkInfo(e.currentTarget.dataset.cardId, res => {
            that.findworkInfo()
        })
    },
    // close dialog
    _closeDialog (e) {
        this.setData({
            'hideWorkDialog': true
        })
    },

    
    // 其他信息
    showDialog (e) {
        this.setData({
            'textareaContent': this.data.otherInfo[e.currentTarget.dataset.operationalDataIndex]['content' + e.currentTarget.dataset.operationalDataIndex] || '',
            'operationalDataIndex': e.currentTarget.dataset.operationalDataIndex,
            'showDialog': true,
        })
    },
    closeDialog () {
        this.setData({
            'showDialog': false
        })
    },
    resetContent () {
        this.setData({
            'textareaContent': ''
        })
    },
    handleTextareaSubmit (e) {
        this.setData({
            'showDialog': false,
            ['otherInfo[' + this.data.operationalDataIndex + '].content' + this.data.operationalDataIndex]: e.detail.value.editContent
        })

    },
    // titile input input
    hangdleTitleBindinput (e) {
        let index = e.currentTarget.dataset.operationalDataIndex
        this.setData({
            ['otherInfo[' + index + '].title' + index]: e.detail.value ? e.detail.value : ''
        })
    },

    // content input input
    hangdleValueBindinput (e) {
        let index = e.currentTarget.dataset.operationalDataIndex
        this.setData({
            ['otherInfo[' + index + '].content' + index]: e.detail.value ? e.detail.value : ''
        })
    },

    // delete row
    handleDeleteInfo (e) {
        if (this.data.otherInfo.length > 1) {
            let temp = []
            let infoArray = []
            temp = this.data.otherInfo.slice(0)
            temp.splice(e.currentTarget.dataset.operationalDataIndex, 1)
            this.handleOperationalData(temp, e.currentTarget.dataset.operationalDataIndex, 'delete')
        } else {
            app.noneToast('请至少保留一条信息 @_@')
            return
        }
    },

    // add row
    handleAddInfo (e) {
        if (this.data.otherInfo.length < 20) { // limit 20 row
            let temp = []
            let indexAdd = e.currentTarget.dataset.operationalDataIndex + 1
            temp = this.data.otherInfo.slice(0)
            this.handleOperationalData(temp, indexAdd, 'add')
        }
    },

    // handle the data hen the row is deleted or added
    handleOperationalData (infoAry, operationalDataIndex, type) {
        let infoArray = []
        infoAry.forEach((val, index) => {
            if (index < operationalDataIndex) {
                infoArray.push(val)
            } else {
                if (type === 'add') {
                    infoArray.push({
                        ['title' + (index + 1)]: val['title' + index],
                        ['content' + (index + 1)]: val['content' + index],
                    })
                    
                } 
                if (type === 'delete') {
                    infoArray.push({
                        ['title' + index]: val['title' + (index + 1)],
                        ['content' + index]: val['content' + (index + 1)],
                    })
                }
                
            }
        })

        if (infoArray.length === infoAry.length && type === 'add')
        infoArray.splice(operationalDataIndex, 0, {
            ['title' + operationalDataIndex]: '', 
            ['content' + operationalDataIndex]: '点击输入内容'
        })
        
        this.setData({
            'otherInfo': infoArray
        })
    },

    handleOtherFormSubmit (e) {
        if (!this.rejectEditFn()) return
        if (!this.verificationForm(e.detail.value)) return
        let params = {
            ...e.detail.value,
            userName: this.data.baseInfo.userName,
            phoneNumber: this.data.baseInfo.phoneNumber
        }
        if (this.data.canOtherSubmit) {
            this.setData({
                'canOtherSubmit': false
             })
             if (!this.data.recordId) {
                this.addOtherkInfo(params)
            } else {
                sdkApi.deleteOtherInfo(this.data.recordId, res => {
                    this.addOtherkInfo(params, 'refresh')
                })
            }
        }
    },

    addOtherkInfo (params, refresh) {
        sdkApi.addOtherkInfo(params, res => {
            app.successToast()
            if (refresh === 'refresh') {
              this.findOtherkInfo()
            }
            setTimeout(() => {
                this.setData({
                    'canOtherSubmit': true
                })
            }, 1000)
        })
    }
})