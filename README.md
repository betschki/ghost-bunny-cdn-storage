
#  BunnyCDN Storage Adapter for Ghost

BunnyCDNAdapter is a custom storage adapter for Ghost CMS, enabling you to store your media files using [BunnyCDN's storage solutions](https://bunny.net/storage/).

This adapter implements the [Ghost documentation on storage adapters](https://ghost.org/docs/config/#storage-adapters).
  

##  Installation via git
1. Navigate to your content folder within Ghost's root directory (probably `./content`).
2. Create an `adapters/storage` folder inside the content folder, if it doesn't exist.
3. Change into the directory with `cd adapters/storage`.
4. Clone this git repository with `git clone https://github.com/betschki/ghost-bunny-cdn-storage.git bunny-cdn`.

## Configuring the adapter
To configure the adapter, you have two options. You can either edit your configuration file or set environment variables.

Edit the individual values according to your BunnyCDN configuration. You can also have a look at the `configuration.example.json` or `example.env` files to see how the configuration should look like.

The final URL with this sample configuration would look like this:

```
https://cdn.your-pull-zone-hostname.com/folder/file.jpg
```


### Configuration file
If you want to set the configuration by editing your configuration file (e.g. `config.production.json`) add the following to it:

```json
"storage":  {
  "active":  "bunny-cdn",
  "bunny-cdn":  {
    "endpoint":  "https://storage.bunnycdn.com",
    "storageZone":  "your-storage-zone",
    "hostname":  "cdn.your-pull-zone-hostname.com",
    "folder":  "a-folder-you-want-to-use",
    "accessKey":  "your-access-key"
  }
}
```

### Environment variables
To use environment variables, you need to set the following variables:
```bash
BUNNYCDN_ENDPOINT="https://storage.bunnycdn.com"
BUNNYCDN_STORAGE_ZONE="your-storage-zone"
BUNNYCDN_HOSTNAME="cdn.your-pull-zone-hostname.com"
BUNNYCDN_FOLDER="a-folder-you-want-to-use"
BUNNYCDN_ACCESS_KEY="your-access-key"
```

### Setting a folder
This adapter has been developed for the usage within [magicpages.co](https://magicpages.co) customer sites. One requirement was the ability to set a folder, as you can see in the final URL example above.

If you wish to save your files into the root directory of your storage zone, set `folder` in your configuration file to `null`.