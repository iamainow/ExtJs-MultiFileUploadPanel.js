/**
 * Example Controller for MultiFileUploadPanel
 * Demonstrates how to process uploaded files
 */
(function() {
    if (typeof Ext === 'undefined') {
        return;
    }
    
    Ext.define('Ext.ux.upload.UploadController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.fileupload',
    
    init: function() {
        var me = this,
            uploadPanel = me.lookupReference('uploadPanel');
        
        uploadPanel.on({
            fileadded: me.onFileAdded,
            fileremoved: me.onFileRemoved,
            fileschanged: me.onFilesChanged,
            filescleared: me.onFilesCleared,
            validationerror: me.onValidationError,
            scope: me
        });
    },
    
    onFileAdded: function(record) {
        console.log('File added:', record.get('name'));
    },
    
    onFileRemoved: function(record) {
        console.log('File removed:', record.get('name'));
    },
    
    onFilesChanged: function(count) {
        console.log('Files count changed:', count);
        var uploadBtn = this.lookupReference('uploadButton');
        if (uploadBtn) {
            uploadBtn.setDisabled(count === 0);
        }
    },
    
    onFilesCleared: function() {
        console.log('All files cleared');
    },
    
    onValidationError: function(message) {
        Ext.Msg.alert('Validation Error', message);
    },
    
    onUploadClick: function() {
        var me = this,
            uploadPanel = me.lookupReference('uploadPanel'),
            files = uploadPanel.getFiles();
        
        if (files.length === 0) {
            Ext.Msg.alert('No Files', 'Please select files to upload');
            return;
        }
        
        Ext.Msg.confirm('Upload Files', 'Upload ' + files.length + ' file(s)?', function(btn) {
            if (btn === 'yes') {
                me.uploadFiles(files, uploadPanel);
            }
        });
    },
    
    uploadFiles: function(files, uploadPanel) {
        var me = this,
            uploadBtn = me.lookupReference('uploadButton'),
            formData = new FormData();
        
        for (var i = 0; i < files.length; i++) {
            formData.append('files', files[i], files[i].name);
        }
        
        if (uploadBtn) {
            uploadBtn.setDisabled(true);
        }
        
        Ext.Ajax.request({
            url: '/api/upload',
            rawData: formData,
            headers: {
                'Content-Type': null
            },
            success: function(response) {
                Ext.Msg.alert('Success', files.length + ' file(s) uploaded successfully');
                uploadPanel.clearFiles();
            },
            failure: function(response) {
                Ext.Msg.alert('Error', 'Upload failed: ' + (response.statusText || 'Server error'));
            },
            callback: function() {
                if (uploadBtn) {
                    uploadBtn.setDisabled(false);
                }
            }
        });
    }
});
})();
